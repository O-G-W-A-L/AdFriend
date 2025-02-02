import { useState } from 'react'

const ActivityReminder = () => {
  const [completed, setCompleted] = useState(false)
  const activities = [
    'Take 5 deep breaths',
    'Do 10 squats',
    'Drink some water',
    'Stretch your shoulders'
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-lg font-semibold text-purple-600">
        {completed ? 'Great job! 🎉' : 'Activity Reminder'}
      </div>
      <p className="text-center mb-2">
        {completed ? 'Keep up the good work!' : activities[Math.floor(Math.random() * activities.length)]}
      </p>
      <button
        onClick={() => setCompleted(!completed)}
        className={`px-4 py-2 rounded-full ${
          completed ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'
        } text-white transition-colors`}
      >
        {completed ? 'Completed!' : 'Mark as Done'}
      </button>
    </div>
  )
}

export default ActivityReminder
