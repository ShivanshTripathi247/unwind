"use client";

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// We need to register the 'ArcElement' for pie charts
ChartJS.register(ArcElement, Tooltip, Legend);

type JournalEntry = {
  text: string;
  emotion: string;
  timestamp: string;
};

// Define a color palette for our emotions
const emotionColors = {
    joy: 'rgba(251, 191, 36, 0.8)',      // Amber
    sadness: 'rgba(59, 130, 246, 0.8)',  // Blue
    anxiety: 'rgba(139, 92, 246, 0.8)', // Violet
    anger: 'rgba(239, 68, 68, 0.8)',     // Red
    neutral: 'rgba(156, 163, 175, 0.8)', // Gray
};

export default function EmotionPieChart({ entries }: { entries: JournalEntry[] }) {
  // 1. Calculate the count of each emotion
  const emotionCounts = entries.reduce((acc, entry) => {
    const emotion = entry.emotion.toLowerCase();
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Prepare the data for Chart.js
  const data = {
    labels: Object.keys(emotionCounts).map(e => e.charAt(0).toUpperCase() + e.slice(1)), // e.g., ['Joy', 'Sadness']
    datasets: [
      {
        label: '# of Entries',
        data: Object.values(emotionCounts),
        backgroundColor: Object.keys(emotionCounts).map(emotion => emotionColors[emotion as keyof typeof emotionColors] || '#ccc'),
        borderColor: '#ffffff',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Your Overall Emotional Distribution',
            font: {
                size: 16
            }
        }
    }
  }

  return <Pie data={data} options={options} />;
}
