"use client";

import { motion } from "framer-motion";
import FloatingNavBar from "../components/FloatingNavBar";

export default function AboutPage() {
  return (
    <>
      <FloatingNavBar />
      <main className="min-h-screen bg-gradient-to-b from-[#1a1333] via-[#1a1333] to-black text-white overflow-hidden font-sans">
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Gradient Blobs */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-500 via-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          <div className="container relative z-10 flex flex-col items-center py-20 mt-20">
            <motion.div
              className="w-full max-w-6xl glass-card p-10 animate-fade-in-up"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg">About Our Technology: Your Personal AI Wellness Companion</h1>
              <p className="mb-6 text-white/80 text-lg">
                Welcome to our platform. We created this space because we believe that understanding your own emotional patterns is the first step toward improved mental well-being. This application is more than just a digital journal; it's a sophisticated, private, and compassionate partner designed to help you discover the "why" behind your feelings.
              </p>
              <p className="mb-8 text-white/80 text-lg">
                Our philosophy is built on privacy and technological ownership. The core intelligence of this application runs on our own servers, using models we have custom-trained. Your journal entries are for your eyes only, used solely to power the insights you see.
              </p>
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">How It Works: From Your Words to Actionable Insight</h2>
              <ol className="list-decimal list-inside mb-8 text-white/80 text-lg space-y-2">
                <li><strong className="text-indigo-300">You Write:</strong> You share your thoughts in our secure journaling interface.</li>
                <li><strong className="text-indigo-300">We Analyze:</strong> Your entry is sent to our private Python backend, where it's processed by a series of specialized AI models.</li>
                <li><strong className="text-indigo-300">You Discover:</strong> The results are presented back to you on your personal dashboard, not just as raw data, but as visual charts, AI-generated suggestions, and time-aware insights.</li>
              </ol>
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">The AI Engine: A Look Under the Hood</h2>
              <div className="mb-8 text-white/80 text-lg space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-pink-300">Step 1: Understanding Emotion with NLP (The Emotion Detector)</h3>
                  <ul className="list-disc list-inside mb-2">
                    <li><strong className="text-indigo-300">Model:</strong> A fine-tuned <span className="font-mono">DistilBERT</span> model.</li>
                    <li><strong className="text-indigo-300">Task:</strong> Multi-class text classification.</li>
                    <li><strong className="text-indigo-300">How it Works:</strong> Think of this model as an expert linguist trained to read text and instantly grasp its emotional tone. We chose <span className="font-mono">DistilBERT</span> because it's a smaller, faster version of the groundbreaking BERT model from Google, offering an ideal balance of speed and accuracy for a responsive web application. We further specialized it by fine-tuning it on the <span className="font-mono">GoEmotions</span> dataset, making it particularly skilled at recognizing nuanced human emotions in text.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-pink-300">Step 2: Personalized Guidance from Your Custom AI (The Wellness Coach)</h3>
                  <ul className="list-disc list-inside mb-2">
                    <li><strong className="text-indigo-300">Model:</strong> A custom-trained Small Language Model (SLM) based on <span className="font-mono">Qwen/Qwen1.5-0.5B</span>.</li>
                    <li><strong className="text-indigo-300">Task:</strong> Instruction-following and conditional text generation.</li>
                    <li><strong className="text-indigo-300">How it Works:</strong> This model's job is to act as your personal wellness coach. It receives your recent emotional history and generates a unique, empathetic suggestion. The magic here is in the training:
                      <ul className="list-disc list-inside ml-6">
                        <li><strong>Instruction Fine-Tuning:</strong> We created a bespoke dataset of hundreds of <span className="font-mono">instruction -&gt; input -&gt; perfect response</span> examples, teaching the model our specific philosophy of support and embedding a warm, encouraging, and non-clinical tone into its very architecture.</li>
                        <li><strong>PEFT/LoRA:</strong> We used <span className="font-mono">Parameter-Efficient Fine-Tuning (PEFT)</span> with <span className="font-mono">Low-Rank Adaptation (LoRA)</span> for efficient, specialized training, making our AI uniquely attuned to providing supportive wellness advice with remarkable efficiency.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-pink-300">Step 3: Uncovering Deeper Patterns (The Time-Aware Analyst)</h3>
                  <ul className="list-disc list-inside mb-2">
                    <li><strong className="text-indigo-300">Tool:</strong> The <span className="font-mono">spaCy</span> NLP library.</li>
                    <li><strong className="text-indigo-300">Task:</strong> Topic-Emotion Correlation and Trend Analysis.</li>
                    <li><strong className="text-indigo-300">How it Works:</strong> This engine acts as a data analyst, splitting your journal history into "earlier" and "later" periods and comparing them to find meaningful patterns, such as an <span className="font-mono">Emotional Shift</span> or an <span className="font-mono">Emerging Challenge</span> for deep, "aha!" moments.</li>
                  </ul>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">Your Data's Journey & Our Commitment to Privacy</h2>
              <ol className="list-decimal list-inside mb-8 text-white/80 text-lg space-y-2">
                <li>Your journal entry is written on your device.</li>
                <li>It is sent over a secure, encrypted connection (HTTPS) to our <span className="font-mono">Python Flask backend</span>.</li>
                <li>The analysis is performed entirely on our server by the models described above. <span className="font-bold text-pink-300">Your data is NOT sent to any third-party AI companies (like OpenAI or Google) for analysis.</span></li>
                <li>The result (the emotion, suggestion, etc.) is sent back to your browser.</li>
                <li>Your entry is stored in our private, encrypted <span className="font-mono">MongoDB Atlas</span> database, ready to power your personal dashboard and insights.</li>
              </ol>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
