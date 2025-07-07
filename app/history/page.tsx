"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import FloatingNavBar from "../components/FloatingNavBar";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Import base styles

// Define a type for our journal entry for better code quality
type JournalEntry = {
  text: string;
  emotion: string;
  timestamp: string;
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the full history and the unique dates with entries
        const [historyRes, datesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history/dates`),
        ]);

        const historyData = await historyRes.json();
        const datesData = await datesRes.json();

        setEntries(historyData);
        setEntryDates(datesData);
      } catch (error) {
        console.error("Failed to fetch history data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
 
  const handleDeleteEntry = async (timestamp: string) => {
    try {
      // --- THIS IS THE FIX ---
      // Encode the timestamp to make it URL-safe
      const encodedTimestamp = encodeURIComponent(timestamp);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${encodedTimestamp}`, {
        method: 'DELETE',
      });
      // ---------------------

      if (response.ok) {
        setEntries(currentEntries => currentEntries.filter(entry => entry.timestamp !== timestamp));
      } else {
        console.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      if (entryDates.includes(dateString)) {
        return 'has-entry'; // We'll define this class in our CSS
      }
    }
    return null;
  };
  
  // Filter entries to show only those from the selected date
  const filteredEntries = entries.filter(entry => {
    if (!selectedDate) return true; // Show all if no date is selected
    const entryDate = new Date(entry.timestamp).toDateString();
    return entryDate === selectedDate.toDateString();
  });

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
          <div className="w-full max-w-5xl relative z-10 mt-26">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-lg animate-fade-in-up">
                Your Journal History
              </h1>
            </div>
            {isLoading ? (
              <p className="text-white/80 animate-fade-in">Loading your history...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
                {/* Calendar View */}
                <div className="md:col-span-1">
                  <h2 className="text-2xl font-semibold mb-6 text-white/90">Calendar View</h2>
                  <div className="calendar-premium glass-card p-6 rounded-3xl shadow-2xl border border-white/10">
                    <Calendar
                      onChange={(value) => setSelectedDate(value as Date)}
                      value={selectedDate}
                      tileClassName={tileClassName}
                      prev2Label={null}
                      next2Label={null}
                      formatShortWeekday={(locale, date) => date.toLocaleDateString(locale, { weekday: 'short' }).charAt(0)}
                    />
                  </div>
                  <button 
                    onClick={() => setSelectedDate(null)} 
                    className="w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white p-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
                  >
                    Show All Entries
                  </button>
                </div>
                {/* Entries List */}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-semibold mb-6 text-white/90">
                    {selectedDate 
                      ? `Entries for ${selectedDate.toLocaleDateString()}`
                      : "All Entries"}
                  </h2>
                  <div className="space-y-8 animate-fade-in-up">
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry, index) => (
                        <div key={entry.timestamp} className="glass-card p-10 relative text-lg">
                          <button
                            onClick={() => handleDeleteEntry(entry.timestamp)}
                            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-red-600 text-red-400 hover:text-white font-bold text-2xl transition-colors duration-200 shadow-md"
                            aria-label="Delete entry"
                            title="Delete entry"
                          >
                            &times;
                          </button>
                          <p className="text-base text-white/60 mb-3">{new Date(entry.timestamp).toLocaleString()}</p>
                          <p className="text-xl text-white/90 mb-5">{entry.text}</p>
                          <p className="text-xl">
                            Detected Emotion: {" "}
                            <span className="font-bold text-pink-400 capitalize animate-pulse">{entry.emotion}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/80 animate-fade-in">No entries found for this day.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .calendar-premium .react-calendar {
          background: rgba(30, 22, 60, 0.85);
          border-radius: 1.25rem;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 32px 0 rgba(80, 0, 120, 0.15);
          color: #fff;
          font-size: 1.25rem;
          padding: 1.5rem 1rem;
        }
        .calendar-premium .react-calendar__navigation button {
          color: #fff;
          background: linear-gradient(90deg, #a78bfa 0%, #f472b6 50%, #60a5fa 100%);
          border-radius: 0.5rem;
          margin: 0 2px;
          font-weight: 600;
          transition: background 0.2s;
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
        }
        .calendar-premium .react-calendar__navigation button:enabled:hover {
          background: linear-gradient(90deg, #f472b6 0%, #a78bfa 100%);
        }
        .calendar-premium .react-calendar__tile {
          background: transparent;
          color: #fff;
          border-radius: 0.75rem;
          transition: background 0.2s, color 0.2s;
          min-width: 3rem;
          min-height: 3rem;
          font-size: 1.1rem;
        }
        .calendar-premium .react-calendar__tile--active,
        .calendar-premium .react-calendar__tile--now {
          background: linear-gradient(90deg, #a78bfa 0%, #f472b6 100%);
          color: #fff;
          font-weight: bold;
        }
        .calendar-premium .react-calendar__tile.has-entry {
          background: linear-gradient(90deg, #f472b6 0%, #60a5fa 100%);
          color: #fff;
          font-weight: bold;
          box-shadow: 0 2px 8px 0 rgba(244, 114, 182, 0.15);
        }
        .calendar-premium .react-calendar__tile:enabled:hover {
          background: linear-gradient(90deg, #a78bfa 0%, #f472b6 100%);
          color: #fff;
        }
        .calendar-premium .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          color: #c4b5fd;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .calendar-premium .react-calendar__month-view__days__day--weekend {
          color: #f472b6;
        }
        .calendar-premium .react-calendar__tile--now {
          border: 2px solid #f472b6;
        }
      `}</style>
    </>
  );
}
