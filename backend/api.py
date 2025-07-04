import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForCausalLM
import torch
from pymongo import MongoClient
from datetime import datetime
from collections import defaultdict # --- THIS IS THE FIX ---
import spacy
import random
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Setup Connections and Models ---
# ... (Your existing model loading and MongoDB connection code)
# Ensure all your models and connections are loaded here.
CONNECTION_STRING = os.getenv("MONGO_URI") 
client = MongoClient(CONNECTION_STRING)
db = client['mental_health_db']
journal_collection = db['journal_entries']
goals_collection = db['goals']
user_stats_collection = db['user_stats']

sentiment_model = AutoModelForSequenceClassification.from_pretrained("./backend/mental_health_sentiment_model")
sentiment_tokenizer = AutoTokenizer.from_pretrained("./backend/mental_health_sentiment_model")
suggestion_model = AutoModelForCausalLM.from_pretrained("./backend/mental_llm_merged_offline", device_map="auto")
suggestion_tokenizer = AutoTokenizer.from_pretrained("./backend/mental_llm_merged_offline")
nlp = spacy.load('en_core_web_sm')
print("All connections and models loaded successfully!")


# --- Your existing endpoints (/predict, /history, /generate-suggestion, goals, /stats) ---
# (No changes are needed for these functions. Ensure they are present.)
@app.route('/predict', methods=['POST'])
def predict():
    # ... (your existing predict code)
    data = request.get_json()
    text = data.get('text')
    if not text: return jsonify({"error": "No text provided"}), 400
    current_time = datetime.utcnow()
    inputs = sentiment_tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = sentiment_model(**inputs)
        predicted_class_id = torch.argmax(outputs.logits, dim=1).item()
    predicted_label = sentiment_model.config.id2label[predicted_class_id]
    entry_document = {"text": text, "emotion": predicted_label, "timestamp": current_time}
    journal_collection.insert_one(entry_document)
    user_id = "main_user"
    stats = user_stats_collection.find_one_and_update(
        {'user_id': user_id},
        {'$setOnInsert': {'user_id': user_id, 'streak': 0, 'last_entry_date': None}},
        upsert=True,
        return_document=True
    )
    today = current_time.date()
    last_entry_date = stats.get('last_entry_date')
    if last_entry_date: last_entry_date = last_entry_date.date()
    if last_entry_date == today: pass
    elif last_entry_date == today - timedelta(days=1):
        user_stats_collection.update_one({'user_id': user_id}, {'$inc': {'streak': 1}, '$set': {'last_entry_date': current_time}})
    else:
        user_stats_collection.update_one({'user_id': user_id}, {'$set': {'streak': 1, 'last_entry_date': current_time}})
    return jsonify({"predicted_emotion": predicted_label})

@app.route('/stats', methods=['GET'])
def get_stats():
    user_id = "main_user"
    stats = user_stats_collection.find_one({'user_id': user_id}, {'_id': 0})
    if not stats: return jsonify({'streak': 0})
    return jsonify(stats)

@app.route('/history', methods=['GET'])
def get_history():
    entries = list(journal_collection.find({}, {'_id': 0}).sort("timestamp", -1))
    return jsonify(entries)

@app.route('/generate-suggestion', methods=['GET'])
def generate_suggestion():
    #... (your existing suggestion code)
    recent_entries = list(journal_collection.find({}).sort("timestamp", -1).limit(5))
    if len(recent_entries) < 3: return jsonify({"suggestion": "Keep journaling..."})
    history_string = ""
    for entry in recent_entries: history_string += f"- Emotion: {entry['emotion']}, Entry: \"{entry['text']}\"\n"
    prompt = f"### Instruction:\nYou are an empathetic wellness coach...\n\n### Input:\n{history_string}\n\n### Response:\n"
    inputs = suggestion_tokenizer(prompt, return_tensors="pt").to(suggestion_model.device)
    with torch.no_grad():
        outputs = suggestion_model.generate(**inputs, max_new_tokens=100, pad_token_id=suggestion_tokenizer.eos_token_id)
    response_text = suggestion_tokenizer.decode(outputs[0], skip_special_tokens=True)
    suggestion = response_text.split("### Response:")[1].strip()
    return jsonify({"suggestion": suggestion})

@app.route('/goals', methods=['POST'])
def create_goal():
    # ... (your existing goal creation code)
    data = request.get_json()
    suggestion_text = data.get('suggestion_text')
    if not suggestion_text: return jsonify({'error': 'No suggestion text provided'}), 400
    goal_document = {"suggestion_text": suggestion_text, "status": "pending", "created_at": datetime.utcnow()}
    result = goals_collection.insert_one(goal_document)
    return jsonify({'message': 'Goal created!', 'goal_id': str(result.inserted_id)})

@app.route('/goals/<goal_id>/complete', methods=['POST'])
def complete_goal(goal_id):
    # ... (your existing goal completion code)
    result = goals_collection.update_one({'_id': ObjectId(goal_id)}, {'$set': {'status': 'completed', 'completed_at': datetime.utcnow()}})
    if result.matched_count == 0: return jsonify({'error': 'Goal not found'}), 404
    return jsonify({'message': 'Goal marked as complete!'})

@app.route('/goals', methods=['GET'])
def get_goals():
    # ... (your existing goal retrieval code)
    all_goals = []
    for goal in goals_collection.find({}).sort("created_at", -1):
        goal['_id'] = str(goal['_id'])
        all_goals.append(goal)
    return jsonify(all_goals)
# Add this new function to api.py
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


def process_entries_for_topics(entries):
    # ... (your helper function for entity insights)
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
            if any(keyword in entry['text'].lower() for keyword in keywords): found_topics.add(topic)
        for token in doc:
            if token.pos_ == 'NOUN' and not token.is_stop and len(token.text) > 3: found_topics.add(token.text.capitalize())
            if token.ent_type_ in ['PERSON', 'ORG']: found_topics.add(token.text.capitalize())
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
