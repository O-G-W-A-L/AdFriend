const MotivationalQuote = () => {
  const quotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    // Add more quotes
  ]

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Daily Inspiration</h3>
      <p className="text-gray-600 italic">
        {quotes[Math.floor(Math.random() * quotes.length)]}
      </p>
    </div>
  )
}

export default MotivationalQuote
