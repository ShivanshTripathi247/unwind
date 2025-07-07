import os
import requests 
from dotenv import load_dotenv
from flask import Flask, request, jsonify 
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from urllib.parse import unquote
import spacy
from collections import defaultdict


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["https://unwind-delta.vercel.app"]}})

# --- Setup Connections and Secrets ---
CONNECTION_STRING = os.getenv("MONGO_URI") 
client = MongoClient(CONNECTION_STRING)
db = client['mental_health_db']
journal_collection = db['journal_entries']
goals_collection = db['goals']
user_stats_collection = db['user_stats']

print("Loading NLP model for insights...")
nlp = spacy.load('en_core_web_sm')
print("Backend service initialized and ready to serve requests.")

# Get Hugging Face secrets from environment variables
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_SENTIMENT_URL = os.getenv("HF_SENTIMENT_URL")
HF_SUGGESTION_URL = os.getenv("HF_SUGGESTION_URL")
# You will add this one later for the suggestion model

print("Backend service initialized and ready to serve requests.")


@app.route('/')
def health_check():
    """A simple endpoint to confirm the service is live."""
    return jsonify({"status": "ok", "message": "Backend service is healthy."}), 200

# --- Predict Endpoint (Using Hugging Face) ---
@app.route('/predict', methods=['POST'])
def predict():
    # This 'request' correctly refers to the INCOMING request from the browser
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Prepare the outgoing request to send to Hugging Face
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": text}
    
    # This 'requests' correctly refers to the OUTGOING request library
    response = requests.post(HF_SENTIMENT_URL, headers=headers, json=payload)
    
    # Error handling for the API call
    if response.status_code != 200:
        return jsonify({"error": "Failed to get prediction from Hugging Face endpoint", "details": response.text}), 500
        
    prediction_data = response.json()
    predicted_label = prediction_data[0]['label']
    
    # Save the result to your MongoDB database
    current_time = datetime.utcnow()
    entry_document = {"text": text, "emotion": predicted_label, "timestamp": current_time}
    journal_collection.insert_one(entry_document)
    
    # (Your user streak logic can be added here if needed)

    return jsonify({"predicted_emotion": predicted_label})


# --- Placeholder for Suggestion Endpoint ---
# This endpoint will be updated once you deploy your second model to Hugging Face
@app.route('/generate-suggestion', methods=['GET'])
def generate_suggestion():
    # Step 1: Get the recent entries from the database (this part is the same)
    recent_entries = list(journal_collection.find({}).sort("timestamp", -1).limit(5))
    if len(recent_entries) < 3:
        return jsonify({"suggestion": "Keep journaling to unlock your first personalized insight! You need at least 3 entries."})

    # Step 2: Build the prompt string (this part is also the same)
    history_string = ""
    for entry in recent_entries:
        history_string += f"- Emotion: {entry['emotion']}, Entry: \"{entry['text']}\"\n"
    prompt = f"### Instruction:\nYou are an empathetic and insightful wellness coach...\n\n### Input:\n{history_string}\n\n### Response:\n"

    # Step 3: Call the Hugging Face Inference Endpoint (this is the new part)
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.7
        }
    }
    
    response = requests.post(HF_SUGGESTION_URL, headers=headers, json=payload)

    # Error handling for the API call
    if response.status_code != 200:
        return jsonify({"error": "Failed to get suggestion from Hugging Face endpoint", "details": response.text}), 500

    suggestion_data = response.json()
    
    # The handler.py returns a list with a dictionary, e.g., [{'generated_text': '...'}]
    final_suggestion = suggestion_data[0]['generated_text']

    return jsonify({"suggestion": final_suggestion})
# --- All Other API Endpoints ---
# (Your other endpoints for history, stats, goals, etc.)

@app.route('/history', methods=['GET'])
def get_history():
    entries = list(journal_collection.find({}).sort("timestamp", -1))
    
    # --- THIS IS THE FIX ---
    # Loop through each entry to make it JSON serializable
    for entry in entries:
        # Convert the MongoDB ObjectId to a simple string
        if '_id' in entry:
            entry['_id'] = str(entry['_id'])
            
        # Convert the datetime object to a standardized ISO 8601 string
        if 'timestamp' in entry and isinstance(entry['timestamp'], datetime):
            # The 'Z' at the end explicitly marks the time as UTC
            entry['timestamp'] = entry['timestamp'].isoformat() + "Z"
    # -------------------------

    return jsonify(entries)
    

@app.route('/history/<entry_id>', methods=['DELETE'])
def delete_journal_entry(entry_id):
    try:
        decoded_timestamp_str = unquote(entry_id)
        result = journal_collection.delete_one({'timestamp': datetime.fromisoformat(decoded_timestamp_str.replace("Z", "+00:00"))})
        if result.deleted_count == 0:
            return jsonify({'error': 'Journal entry not found'}), 404
        return jsonify({'message': 'Entry deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Add this new function to your backend/api.py file

@app.route('/history/dates', methods=['GET'])
def get_history_dates():
    """Returns a list of unique dates (YYYY-MM-DD) with journal entries."""
    try:
        # This aggregation pipeline is very efficient for getting unique dates
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$dateToString": { "format": "%Y-%m-%d", "date": "$timestamp" }
                    }
                }
            },
            {
                "$sort": { "_id": 1 } # Sort the dates chronologically
            }
        ]
        
        dates_cursor = journal_collection.aggregate(pipeline)
        
        # Extract the dates into a simple list of strings
        dates = [d['_id'] for d in dates_cursor]
        
        return jsonify(dates)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/stats', methods=['GET'])
def get_stats():
    user_id = "main_user"
    stats = user_stats_collection.find_one({'user_id': user_id}, {'_id': 0})
    if not stats: return jsonify({'streak': 0})
    return jsonify(stats)

@app.route('/goals', methods=['POST'])
def create_goal():
    data = request.get_json()
    suggestion_text = data.get('suggestion_text')
    if not suggestion_text: return jsonify({'error': 'No suggestion text provided'}), 400
    goal_document = {"suggestion_text": suggestion_text, "status": "pending", "created_at": datetime.utcnow()}
    result = goals_collection.insert_one(goal_document)
    return jsonify({'message': 'Goal created!', 'goal_id': str(result.inserted_id)})

@app.route('/goals/<goal_id>/complete', methods=['POST'])
def complete_goal(goal_id):
    result = goals_collection.update_one({'_id': ObjectId(goal_id)}, {'$set': {'status': 'completed', 'completed_at': datetime.utcnow()}})
    if result.matched_count == 0: return jsonify({'error': 'Goal not found'}), 404
    return jsonify({'message': 'Goal marked as complete!'})

@app.route('/goals/<goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """Deletes a specific goal by its ID."""
    try:
        # Convert the goal_id string from the URL into a MongoDB ObjectId
        result = goals_collection.delete_one({'_id': ObjectId(goal_id)})
        
        # Check if a document was actually deleted
        if result.deleted_count == 0:
            return jsonify({'error': 'Goal not found'}), 404
            
        return jsonify({'message': 'Goal deleted successfully'}), 200
    except Exception as e:
        # Handle potential errors, e.g., an invalid ObjectId format
        return jsonify({'error': str(e)}), 400

@app.route('/goals', methods=['GET'])
def get_goals():
    all_goals = []
    for goal in goals_collection.find({}).sort("created_at", -1):
        goal['_id'] = str(goal['_id'])
        all_goals.append(goal)
    return jsonify(all_goals)


def process_entries_for_topics(entries):
    keyword_categories = {
        'Work & Career': ['job', 'work', 'boss', 'colleague', 'project', 'deadline', 'career', 'office', 'meeting'],
        'Relationships': ['friend', 'partner', 'family', 'mom', 'dad', 'sister', 'brother', 'relationship', 'date'],
        'Health & Body': ['sleep', 'tired', 'health', 'exercise', 'gym', 'run', 'food', 'eat', 'sick'],
        'Personal Growth': ['learn', 'read', 'book', 'goal', 'habit', 'future', 'myself', 'grow'],
    }
    topic_emotion_map = defaultdict(lambda: defaultdict(int))
    for entry in entries:
        doc = nlp(entry['text'].lower())
        found_topics = set()
        for topic, keywords in keyword_categories.items():
            if any(keyword in entry['text'].lower() for keyword in keywords):
                found_topics.add(topic)
        for token in doc:
            if token.pos_ == 'NOUN' and not token.is_stop and len(token.text) > 3:
                found_topics.add(token.text.capitalize())
            if token.ent_type_ in ['PERSON', 'ORG']:
                found_topics.add(token.text.capitalize())
        for topic in found_topics:
            topic_emotion_map[topic][entry['emotion']] += 1
    return topic_emotion_map


@app.route('/entity-insights', methods=['GET'])
def get_entity_insights():
    # ... (your time-aware analyst code)
    all_entries = list(journal_collection.find({}).sort("timestamp", 1))
    if len(all_entries) < 10: return jsonify({'insights': ["Keep journaling to unlock deeper time-based insights! You need at least 10 entries."]})
    midpoint = len(all_entries) // 2
    earlier_entries, later_entries = all_entries[:midpoint], all_entries[midpoint:]
    earlier_topics, later_topics = process_entries_for_topics(earlier_entries), process_entries_for_topics(later_entries)
    insights = []
    positive_emotions, negative_emotions = {'joy'}, {'anxiety', 'sadness', 'anger'}
    all_topics = set(earlier_topics.keys()) | set(later_topics.keys())
    for topic in all_topics:
        earlier_emotions, later_emotions = earlier_topics.get(topic, {}), later_topics.get(topic, {})
        if not earlier_emotions or not later_emotions: continue
        earlier_main_emotion, later_main_emotion = max(earlier_emotions, key=earlier_emotions.get), max(later_emotions, key=later_emotions.get)
        if earlier_main_emotion != later_main_emotion:
            insights.append(f"**Emotional Shift:** I've noticed that discussions about **'{topic}'** used to be linked with '{earlier_main_emotion}', but have recently shifted to being about **'{later_main_emotion}'**.")
            continue
        earlier_pos_count, later_pos_count = sum(earlier_emotions.get(e, 0) for e in positive_emotions), sum(later_emotions.get(e, 0) for e in positive_emotions)
        if later_pos_count > earlier_pos_count and earlier_main_emotion in positive_emotions:
            insights.append(f"**Positive Progress:** It's great to see that topics related to **'{topic}'** are appearing with **more positive emotions** recently.")
            continue
        later_neg_count, earlier_neg_count = sum(later_emotions.get(e, 0) for e in negative_emotions), sum(earlier_emotions.get(e, 0) for e in negative_emotions)
        if later_neg_count > earlier_neg_count and later_main_emotion in negative_emotions:
            insights.append(f"**Emerging Challenge:** It seems that **'{topic}'** has recently become a more frequent source of **'{later_main_emotion}'**.")
    if not insights:
        simple_insights = []
        all_topics_map = process_entries_for_topics(all_entries)
        for topic, emotions in all_topics_map.items():
            if sum(emotions.values()) > 2:
                most_common_emotion = max(emotions, key=emotions.get)
                simple_insights.append(f"Discussions about **'{topic}'** often correlate with feelings of **'{most_common_emotion}'**.")
        return jsonify({'insights': simple_insights[:5]})
    return jsonify({'insights': insights[:5]})



if __name__ == '__main__':
    app.run(port=5000, debug=True)
