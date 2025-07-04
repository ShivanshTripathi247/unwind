"use client";

import { useState, useEffect } from 'react';
// Import the ReactMarkdown component
import ReactMarkdown from 'react-markdown';

export default function EntityInsightsCard() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entity-insights`);
        const data = await response.json();
        setInsights(data.insights || []);
      } catch (error) {
        console.error('Failed to fetch entity insights:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) return (
    <div className="glass-card p-8 text-center animate-fade-in-up">
      <span className="loader border-t-2 border-b-2 border-white w-6 h-6 rounded-full animate-spin mx-auto mb-2"></span>
      <div className="text-white/80">Loading deeper insights...</div>
    </div>
  );

  if (insights.length === 0) {
    return (
      <div className="glass-card p-8 animate-fade-in-up">
        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">Deeper Insights</h3>
        <p className="text-white/70">Keep journaling to discover connections between topics and your emotions!</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 animate-fade-in-up">
      <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">Deeper Insights: What & Why</h3>
      <ul className="space-y-4">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start text-white/90">
            <span className="text-indigo-400 mr-3 mt-1 text-lg">✨</span>
            <ReactMarkdown
              components={{
                strong: ({node, ...props}) => <span className="font-bold text-indigo-300" {...props} />
              }}
            >
              {insight}
            </ReactMarkdown>
          </li>
        ))}
      </ul>
    </div>
  );
}
