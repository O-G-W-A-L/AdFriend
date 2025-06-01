import React, { useState, useEffect } from "react";

// Simple CSV parser function (assumes no commas in fields)
const parseCSV = (text) => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry = {};
    headers.forEach((header, index) => {
      entry[header.trim()] = values[index].trim().replace(/^"|"$/g, "");
    });
    return entry;
  });
};

const MoodTracker = () => {
  const moods = ["😀", "😐", "😢", "😡", "😴"];
  const [selectedMood, setSelectedMood] = useState(null);
  const [quote, setQuote] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUpliftingContent = async () => {
    setLoading(true);
    try {
      // Fetch quotes.csv and reminders.csv from the public folder
      const [quotesRes, remindersRes] = await Promise.all([
        fetch("/data/quotes.csv"),
        fetch("/data/reminders.csv"),
      ]);
      const [quotesText, remindersText] = await Promise.all([
        quotesRes.text(),
        remindersRes.text(),
      ]);
      const quotesData = parseCSV(quotesText);
      const remindersData = parseCSV(remindersText);
      
      // For a "bad" mood, choose a random quote with category "motivation" or "inspiration"
      const upliftingQuotes = quotesData.filter(
        (q) => q.category.toLowerCase() === "motivation" || q.category.toLowerCase() === "inspiration"
      );
      const randomQuote = upliftingQuotes[Math.floor(Math.random() * upliftingQuotes.length)];
      
      // Choose a random reminder from remindersData (all assumed uplifting)
      const randomReminder = remindersData[Math.floor(Math.random() * remindersData.length)];

      setQuote(randomQuote);
      setReminder(randomReminder);
    } catch (error) {
      console.error("Error fetching uplifting content:", error);
    } finally {
      setLoading(false);
    }
  };

  // When a mood is selected, if it is considered "bad", fetch uplifting content
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Define bad moods
    const badMoods = ["😢", "😡", "😴"];
    if (badMoods.includes(mood)) {
      fetchUpliftingContent();
    } else {
      // For good moods, clear any previously fetched uplifting content
      setQuote(null);
      setReminder(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Mood Tracker</h2>
      <div className="flex gap-4 mb-4">
        {moods.map((mood, index) => (
          <button
            key={index}
            className={`text-2xl p-2 ${selectedMood === mood ? "bg-gray-300 rounded" : ""}`}
            onClick={() => handleMoodSelect(mood)}
          >
            {mood}
          </button>
        ))}
      </div>
      {selectedMood && (
        <p className="mb-4">
          You selected: <span className="font-bold">{selectedMood}</span>
        </p>
      )}
      {loading && <p>Loading uplifting content...</p>}
      {/* Display uplifting content if a bad mood is selected */}
      {!loading && selectedMood && ["😢", "😡", "😴"].includes(selectedMood) && (
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Here's something to uplift you:</h3>
          {quote && (
            <div className="mb-2">
              <p className="italic">"{quote.quote}"</p>
              {quote.author && <p className="text-sm">- {quote.author}</p>}
            </div>
          )}
          {reminder && <p className="text-sm">{reminder.reminder}</p>}
        </div>
      )}
      {/* For good moods, display a playful message */}
      {!loading && selectedMood && !["😢", "😡", "😴"].includes(selectedMood) && (
        <div className="p-4 border rounded">
          <p className="text-sm">Keep shining and enjoy your day!</p>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;