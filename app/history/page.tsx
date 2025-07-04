"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import FloatingNavBar from "../components/FloatingNavBar";

// Define a type for our journal entry for better code quality
type JournalEntry = {
  text: string;
  emotion: string;
  timestamp: string;
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the history from our new backend endpoint
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history`);
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []); // The empty array means this effect runs once when the page loads

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
          <div className="w-full max-w-4xl relative z-10 mt-30">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-fade-in-up">
                Your Journal History
              </h1>
            </div>
            {isLoading ? (
              <p className="text-white/80 animate-fade-in">Loading history...</p>
            ) : entries.length > 0 ? (
              <div className="space-y-6 animate-fade-in-up">
                {entries.map((entry, index) => (
                  <div key={index} className="glass-card p-8">
                    <p className="text-sm text-white/60 mb-2">{new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="text-lg text-white/90 mb-4">{entry.text}</p>
                    <p className="text-lg">
                      Detected Emotion: {" "}
                      <span className="font-bold text-pink-400 capitalize animate-pulse">{entry.emotion}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/80 animate-fade-in">No journal entries found. Go analyze some text!</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
