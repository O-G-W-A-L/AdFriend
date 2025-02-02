import { useEffect, useState } from 'react'
import MotivationalQuote from './MotivationalQuote'
import ActivityReminder from './ActivityReminder'

const AdReplacer = () => {
  const [widgetType, setWidgetType] = useState('quote')

  useEffect(() => {
    const types = ['quote', 'reminder']
    const randomType = types[Math.floor(Math.random() * types.length)]
    setWidgetType(randomType)
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl animate-fade-in">
      {widgetType === 'quote' && <MotivationalQuote />}
      {widgetType === 'reminder' && <ActivityReminder />}
    </div>
  )
}

export default AdReplacer
