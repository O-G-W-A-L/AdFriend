import { motion } from 'framer-motion'

const WidgetWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-lg overflow-y-auto"
    style={{ minWidth: '400px', minHeight: '300px' }}
  >
    {children}
  </motion.div>
)

export default WidgetWrapper