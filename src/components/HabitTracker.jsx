import React, { useState } from "react";

const HabitTracker = () => {
  const [habits, setHabits] = useState([
    { name: "Drink Water", completed: false },
    { name: "Exercise", completed: false },
  ]);

  const toggleHabit = (index) => {
    const updatedHabits = [...habits];
    updatedHabits[index].completed = !updatedHabits[index].completed;
    setHabits(updatedHabits);
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Habit Tracker</h2>
      {habits.map((habit, index) => (
        <div key={index} className="flex items-center gap-2 p-2">
          <input
            type="checkbox"
            checked={habit.completed}
            onChange={() => toggleHabit(index)}
          />
          <span className={habit.completed ? "line-through text-gray-500" : ""}>
            {habit.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HabitTracker;

