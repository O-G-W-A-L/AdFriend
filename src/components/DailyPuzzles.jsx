import React, { useState } from "react";

const puzzles = [
  { question: "What has to be broken before you can use it?", answer: "An egg" },
  { question: "I'm tall when I'm young, and I'm short when I'm old. What am I?", answer: "A candle" },
];

const DailyPuzzles = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(
    puzzles[Math.floor(Math.random() * puzzles.length)]
  );
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-bold">Daily Puzzle</h2>
      <p>{currentPuzzle.question}</p>
      <button
        className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {showAnswer ? "Hide Answer" : "Show Answer"}
      </button>
      {showAnswer && <p className="mt-2">{currentPuzzle.answer}</p>}
    </div>
  );
};

export default DailyPuzzles;

