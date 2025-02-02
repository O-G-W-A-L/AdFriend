import { useState } from 'react'
import WidgetWrapper from './components/WidgetWrapper'
import MotivationalQuote from './components/MotivationalQuote'
import ActivityReminder from './components/ActivityReminder'

const App = () => {
  const [activeTab, setActiveTab] = useState('quotes')

  return (
    <div className="hidden adfriend-container">
      <WidgetWrapper>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'quotes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Quotes
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'reminders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Reminders
          </button>
        </div>
        
        {activeTab === 'quotes' && <MotivationalQuote />}
        {activeTab === 'reminders' && <ActivityReminder />}
      </WidgetWrapper>
    </div>
  )
}

export default App