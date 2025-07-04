"use client";

import { useState, useEffect } from 'react';

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats`);
        const data = await response.json();
        setStreak(data.streak || 0);
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      }
    }
    fetchStats();
  }, []); // This could be made to refresh more often later

  return (
    <div className="flex items-center gap-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-bold text-orange-800">{streak} Day Streak</div>
        <div className="text-xs text-orange-600">Keep it going!</div>
      </div>
    </div>
  );
}
