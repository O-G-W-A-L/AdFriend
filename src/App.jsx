import { useState } from 'react'
import WidgetWrapper from './components/WidgetWrapper'
import MotivationalQuote from './components/MotivationalQuote'
import ActivityReminder from './components/ActivityReminder'

const App = () => {
  const [activeTab, setActiveTab] = useState('quotes')

  return (
    <div className="w-full h-full p-4">
      <WidgetWrapper>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'quotes' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Quotes
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'reminders' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Reminders
          </button>
        </div>
        
        <div className="min-h-[250px]">
          {activeTab === 'quotes' && <MotivationalQuote />}
          {activeTab === 'reminders' && <ActivityReminder />}
        </div>
      </WidgetWrapper>
    </div>
  )
}

export default App