"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import EntityInsightsCard from '../components/EntityInsightsCard';
import EmotionPieChart from "../components/EmotionPieChart";
import FloatingNavBar from "../components/FloatingNavBar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type JournalEntry = {
  text: string;
  emotion: string;
  timestamp: string;
};

type Goal = { _id: string; suggestion_text: string; status: 'pending' | 'completed'; };

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATE for our Insight Engine ---
  const [suggestion, setSuggestion] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // ----------------------------------------
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both history and goals at the same time
        const [historyRes, goalsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals`) // We need to add this simple GET endpoint
        ]);
        const historyData = await historyRes.json();
        const goalsData = await goalsRes.json();
        setEntries(historyData.reverse());
        setGoals(goalsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add this function inside your DashboardPage component in app/dashboard/page.tsx
const handleDeleteGoal = async (goalId: string) => {
  try {
    // Send a DELETE request to our new backend endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals/${goalId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // If successful, update the local state to remove the goal from the UI instantly
      setGoals(currentGoals => currentGoals.filter(goal => goal._id !== goalId));
    } else {
      console.error("Failed to delete goal");
    }
  } catch (error) {
    console.error("Error deleting goal:", error);
  }
};


  // --- NEW HANDLER FUNCTION to call the backend ---
  const handleGetSuggestion = async () => {
    setIsGenerating(true);
    setSuggestion(""); // Clear previous suggestion
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-suggestion`);
      const data = await response.json();
      setSuggestion(data.suggestion || "Sorry, we couldn't generate an insight right now.");
    } catch (error) {
      console.error("Failed to fetch suggestion:", error);
      setSuggestion("Sorry, an error occurred while generating your insight.");
    } finally {
      setIsGenerating(false); // Re-enable the button
    }
  };
  // ------------------------------------------------

   // --- NEW Handlers for Goals ---
  const handleCreateGoal = async (suggestionText: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion_text: suggestionText })
      });
      // Refresh goals list after creating a new one
      const goalsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals`);
      setGoals(await goalsRes.json());
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

    const handleCompleteGoal = async (goalId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals/${goalId}/complete`, { method: 'POST' });
      // Refresh goals list
      const goalsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals`);
      setGoals(await goalsRes.json());
    } catch (error) {
      console.error("Failed to complete goal:", error);
    }
  };

  const chartData = {
    labels: entries.map(entry => new Date(entry.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Emotional Score',
        data: entries.map(entry => {
          // Define emotion map with explicit index signature
          const emotionMap: { [key: string]: number } = { 
            "sadness": 0, 
            "anxiety": 1, 
            "anger": 2, 
            "neutral": 3, 
            "joy": 4 
          };
          // Now TypeScript knows emotionMap can be indexed with strings
          return emotionMap[entry.emotion.toLowerCase()] ?? 3;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // 'as const' helps TypeScript with string literal types
      },
      title: {
        display: true,
        text: 'Your Emotional Journey Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        ticks: {
          // This callback function converts the numerical value on the axis
          // (e.g., 0, 1, 2) into a human-readable emotion name.
          callback: function(value: string | number) {
            const emotionMap: { [key: number]: string } = {
              0: 'Sadness',
              1: 'Anxiety',
              2: 'Anger',
              3: 'Neutral',
              4: 'Joy'
            };
            // Check if the value is a number and exists in our map
            if (typeof value === 'number' && emotionMap[value]) {
              return emotionMap[value];
            }
            return ''; // Return an empty string for any other case
          }
        },
        // Setting min and max ensures the y-axis scale is consistent
        // and doesn't change with every new data point.
        min: 0,
        max: 4
      },
      x: {
        ticks: {
          // This rotates the x-axis labels (dates) to prevent them
          // from overlapping if there are many journal entries.
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

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
          <div className="w-full max-w-6xl relative z-10 mt-30">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-fade-in-up">Dashboard</h1>
            </div>
            {/* --- NEW JSX for the Insight Engine UI --- */}
            <div className="my-8 p-8 glass-card text-white rounded-3xl shadow-2xl text-center animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">Your Personalized Insight</h2>
              <p className="mb-4 text-white/80">Click below to get a unique suggestion from your personal AI coach based on your recent entries.</p>
              <button
                onClick={handleGetSuggestion}
                disabled={isGenerating || entries.length < 3}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-400 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Thinking..." : "Generate My Insight"}
              </button>
              {entries.length < 3 && !isGenerating && (
                <p className="text-xs text-white/60 mt-2">You need at least 3 entries to generate an insight.</p>
              )}
              {suggestion && (
                <div className="mt-4 text-left text-lg bg-white/10 p-4 rounded-2xl shadow-md animate-fade-in">
                  <p>{suggestion}</p>
                  <button
                    onClick={() => handleCreateGoal(suggestion)}
                    className="mt-4 bg-green-400 text-green-900 font-bold py-1 px-3 rounded-full text-sm hover:bg-green-300"
                  >
                    I'll do it! Add to my goals.
                  </button>
                </div>
              )}
            </div>
            {/* --- NEW: Goals Display Card --- */}
            <div className="my-8">
              <h3 className="text-xl font-semibold mb-3 text-white/90">Your Wellness Goals</h3>
              <div className="p-8 glass-card space-y-3 animate-fade-in-up">
                {goals.filter(g => g.status === 'pending').length > 0 ? goals.filter(g => g.status === 'pending').map(goal => (
                  <div key={goal._id} className="flex justify-between items-center">
                    <p className="font-bold text-white/90">{goal.suggestion_text}</p>
                    <button onClick={() => handleCompleteGoal(goal._id)} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded hover:bg-green-600">Done!</button>
                    <button 
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded hover:bg-red-600 transition"
                      aria-label="Delete goal"
                    >
                      Delete
                    </button>
                  </div>
                )) : <p className="font-bold text-white/60">No pending goals. Generate an insight to create one!</p>}
                {goals.filter(g => g.status === 'completed').map(goal => (
                  <div key={goal._id} className="flex justify-between items-center opacity-50">
                    <p className="line-through text-white/60">{goal.suggestion_text}</p>
                    <span className="text-green-400 font-bold">Completed!</span>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 my-8">
              <div className="lg:col-span-3 glass-card p-8 animate-fade-in-up">
                {isLoading ? (
                  <p className="text-white/80">Loading chart data...</p>
                ) : entries.length > 0 ? (
                  <Line options={chartOptions} data={chartData} />
                ) : (
                  <p className="text-white/80">No data available for trend chart.</p>
                )}
              </div>
              <div className="lg:col-span-2 glass-card p-8 animate-fade-in-up">
                {isLoading ? (
                  <p className="text-white/80">Loading distribution data...</p>
                ) : entries.length > 0 ? (
                  <EmotionPieChart entries={entries} />
                ) : (
                  <p className="text-white/80">No data available for distribution chart.</p>
                )}
              </div>
            </div>
            <div className="mt-8 animate-fade-in-up">
              <EntityInsightsCard />
            </div>
            <div className="text-center mt-8">
              <p className="text-xs text-white/50">
                Disclaimer: This tool uses AI to generate motivational suggestions. It is not a medical device and does not provide diagnosis or therapy. If you are in crisis, please contact a healthcare professional.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
