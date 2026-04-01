'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your NestQuest AI assistant. I can help you understand your results, answer questions about costs, savings opportunities, and guide you through the homebuying process. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const response = generateResponse(userMessage.content)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    // Cost-related questions
    if (lowerInput.includes('closing cost') || lowerInput.includes('closing cost')) {
      return "Closing costs typically range from 2-5% of the home price. They include lender fees (origination, application), title insurance, settlement fees, government fees, and prepaid costs. Many of these are negotiable! Check your savings opportunities section for tips on reducing them."
    }

    if (lowerInput.includes('monthly payment') || lowerInput.includes('payment')) {
      return "Your monthly payment includes Principal & Interest (the loan itself), Property Taxes, Homeowners Insurance, and PMI (if your down payment is less than 20%). Don't forget to also budget for maintenance reserves (1% of home value per year) and account for escrow cost increases over time."
    }

    if (lowerInput.includes('pmi') || lowerInput.includes('mortgage insurance')) {
      return "PMI (Private Mortgage Insurance) is required when your down payment is less than 20%. It typically costs 0.5-1% of the loan amount annually. The good news: it automatically drops off once you reach 20% equity. You can also request removal once you've built enough equity through payments or home appreciation."
    }

    // Savings questions
    if (lowerInput.includes('save') || lowerInput.includes('saving') || lowerInput.includes('opportunity')) {
      return "Great question! There are many ways to save money when buying a home. Check your 'Savings Opportunities' section for personalized recommendations. Common strategies include: shopping multiple lenders, negotiating closing costs, improving your credit score, shopping title insurance, and requesting e-closing services. Each can save you hundreds to thousands of dollars!"
    }

    if (lowerInput.includes('escrow') || lowerInput.includes('property tax') || lowerInput.includes('insurance')) {
      return "Escrow accounts hold funds for property taxes and homeowners insurance. These costs typically increase over time - property taxes have risen 15.4% since the pandemic, and insurance premiums continue to climb. Your lender adjusts your escrow payment annually based on actual costs. Check the 'Post-Purchase Reserves' section for detailed projections."
    }

    if (lowerInput.includes('maintenance') || lowerInput.includes('repair')) {
      return "Experts recommend budgeting 1% of your home's purchase price annually for maintenance and repairs. This covers routine upkeep (HVAC, plumbing), emergency repairs (roof leaks, appliance failures), and replacements over time. Setting aside this reserve prevents financial stress when unexpected issues arise. See the 'Post-Purchase Reserves' section for details."
    }

    // Affordability questions
    if (lowerInput.includes('afford') || lowerInput.includes('budget') || lowerInput.includes('approved')) {
      return "Lenders will approve you for more than you can comfortably afford. They use a 43% debt-to-income ratio, but the 28/36 rule is safer: housing should be max 28% of income, total debt max 36%. Check your 'Affordability Reality Check' section to see the difference between what lenders approve and what's realistic for you."
    }

    if (lowerInput.includes('readiness') || lowerInput.includes('ready') || lowerInput.includes('score')) {
      return "Your readiness score (0-100) is based on credit score, debt-to-income ratio, down payment, timeline, and savings buffer. A score of 70+ means you're ready to start serious house hunting. Lower scores indicate areas to improve first. Check your 'Readiness Score' section for a detailed breakdown and improvement tips."
    }

    // General help
    if (lowerInput.includes('help') || lowerInput.includes('what can you') || lowerInput.includes('how can you')) {
      return "I can help you understand:\n• Your cost breakdown and what each fee means\n• Savings opportunities and how to negotiate\n• Escrow and maintenance costs\n• Affordability calculations\n• Readiness score components\n• General homebuying questions\n\nJust ask me anything about your results or the homebuying process!"
    }

    // Default response
    return "That's a great question! I can help you understand your results, explain costs, identify savings opportunities, and guide you through the homebuying process. Try asking about:\n• Closing costs and fees\n• Monthly payments\n• Savings opportunities\n• Escrow and maintenance\n• Your readiness score\n\nOr check the detailed sections in your results for comprehensive information!"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
        aria-label="Open AI Chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-900 border-2 border-[#06b6d4] rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot size={24} className="text-white" />
                <div>
                  <h3 className="font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">NestQuest</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#06b6d4] text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot size={16} className="mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User size={16} className="mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your results..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="px-4 py-2 bg-[#06b6d4] text-white rounded-lg hover:bg-[#0891b2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                AI-powered assistant • Answers based on your results
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
