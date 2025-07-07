// We need to specify this for hooks like useState to work
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import StreakCounter from "./components/StreakCounter";
import { CreativeHero } from "./components/CreativeHero";
import FloatingNavBar from "./components/FloatingNavBar";

export default function HomePage() {
  // State to hold the user's input text
  const [inputText, setInputText] = useState("");
  // State to hold the prediction result from the backend
  const [prediction, setPrediction] = useState(null);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeClick = async (event: FormEvent) => {
    event.preventDefault();
    if (!inputText) return; // Don't do anything if text box is empty

    setIsLoading(true);
    setPrediction(null); // Clear previous prediction

    try {
      // Send a POST request to our Python Flask API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      setPrediction(data); // Store the result
    } catch (error) {
      console.error("Error analyzing text:", error);
      // You could set an error state here to show in the UI
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      <FloatingNavBar />
      <main className="min-h-screen bg-gradient-to-b from-[#1a1333] via-[#1a1333] to-black text-white overflow-hidden font-sans">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Gradient Blobs */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-500 via-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <StreakCounter />
              </div>
              <div className="flex items-center justify-center gap-3 mb-10">
                <span className="w-10 h-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-shell-icon lucide-shell"
                  >
                    <path d="M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44" />
                  </svg>
                </span>
                <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-lg">
                  Unwind
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-fade-in-up">
                Your Mental Health Sentiment Tracker
              </h1>
              <motion.p
                className="text-center font-bold tracking-tight mb-8 text-lg text-white/80 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                Write a journal entry or a thought, and we'll analyze the
                underlying emotion.
              </motion.p>
              <motion.textarea
                className="w-full p-4 text-white bg-white/10 border border-white/20 rounded-2xl shadow-xl focus:ring-2 focus:ring-pink-400 backdrop-blur-md transition-all duration-300 placeholder:text-white/50 animate-fade-in"
                rows={8}
                placeholder="How are you feeling today?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              <motion.button
                className="mt-6 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-400 border-0 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-400 animate-fade-in"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loader border-t-2 border-b-2 border-white w-5 h-5 rounded-full animate-spin"></span>
                    Analyzing...
                  </span>
                ) : (
                  <span>Analyze Emotion</span>
                )}
              </motion.button>
              {/* Display the result */}
              {prediction && (
                <motion.div
                  className="mt-10 p-8 bg-white/10 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-lg animate-fade-in-up"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                    Analysis Result
                  </h2>
                  <p className="text-lg text-white/90">
                    Predicted Emotion:{" "}
                    <span className="font-bold text-pink-400 capitalize animate-pulse">
                      {/* @ts-ignore: backend returns predicted_emotion */}
                      {prediction.predicted_emotion}
                    </span>
                  </p>
                </motion.div>
              )}
            </div>
            <motion.div
              className="flex justify-center items-center animate-fade-in-up"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <CreativeHero />
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
