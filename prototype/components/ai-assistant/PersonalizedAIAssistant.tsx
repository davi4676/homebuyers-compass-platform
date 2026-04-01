'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Lock, Crown, ArrowRight } from 'lucide-react'
import { TIER_DEFINITIONS, type UserTier } from '@/lib/tiers'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PersonalizedAIAssistantProps {
  userProfile: {
    name?: string
    buyerType?: string
    location?: string
    priceRange?: string
    downPayment?: string
    creditScore?: string
    timeline?: string
    concerns?: string[]
    tier: UserTier
  }
  currentStep?: number
}

const HOMEBUYING_STEPS = [
  { id: 1, name: 'Get Pre-Approved', icon: '📋' },
  { id: 2, name: 'Find Your Home', icon: '🏠' },
  { id: 3, name: 'Make an Offer', icon: '💰' },
  { id: 4, name: 'Home Inspection', icon: '🔍' },
  { id: 5, name: 'Secure Financing', icon: '🏦' },
  { id: 6, name: 'Final Walkthrough', icon: '👀' },
  { id: 7, name: 'Closing Day', icon: '🎉' },
  { id: 8, name: 'Move In', icon: '🔑' },
]

// Fun Compass Character SVG Component
function CompassCharacter({ isActive, expression = 'happy' }: { isActive: boolean; expression?: 'happy' | 'thinking' | 'excited' }) {
  const expressionMap = {
    happy: { eyes: '^_^', mouth: 'M15,25 Q20,30 25,25' },
    thinking: { eyes: '-_-', mouth: 'M15,25 L25,25' },
    excited: { eyes: '◠‿◠', mouth: 'M15,25 Q20,32 25,25' }
  }
  
  const currentExpression = expressionMap[expression]
  
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      animate={isActive ? {
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Outer compass ring - Gold/Bronze */}
      <circle cx="30" cy="30" r="28" fill="#D4AF37" opacity="0.2" />
      <circle cx="30" cy="30" r="26" fill="none" stroke="#D4AF37" strokeWidth="2" />
      
      {/* Inner compass body - Main character */}
      <circle cx="30" cy="30" r="22" fill="url(#compassGradient)" />
      
      {/* Gradient definition */}
      <defs>
        <radialGradient id="compassGradient">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </radialGradient>
      </defs>
      
      {/* Compass needle (pointing North) - Red */}
      <motion.path
        d="M30,12 L27,22 L30,30 L33,22 Z"
        fill="#ef4444"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '30px', originY: '30px' }}
      />
      
      {/* Compass needle (pointing South) - White */}
      <path
        d="M30,48 L27,38 L30,30 L33,38 Z"
        fill="#f5f5f5"
      />
      
      {/* Center dot */}
      <circle cx="30" cy="30" r="3" fill="#1e293b" />
      
      {/* Cardinal directions (tiny) */}
      <text x="30" y="8" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">N</text>
      <text x="52" y="32" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">E</text>
      <text x="30" y="55" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">S</text>
      <text x="8" y="32" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">W</text>
      
      {/* Eyes */}
      <text x="23" y="27" fontSize="6" fill="#1e293b">{currentExpression.eyes[0]}{currentExpression.eyes[1]}</text>
      <text x="33" y="27" fontSize="6" fill="#1e293b">{currentExpression.eyes[2]}{currentExpression.eyes[3]}</text>
      
      {/* Mouth */}
      <path
        d={currentExpression.mouth}
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Optional sparkles when active */}
      {isActive && (
        <>
          <motion.circle
            cx="10"
            cy="10"
            r="2"
            fill="#fbbf24"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="50"
            cy="15"
            r="2"
            fill="#fbbf24"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle
            cx="48"
            cy="48"
            r="2"
            fill="#fbbf24"
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          />
        </>
      )}
    </motion.svg>
  )
}

export default function PersonalizedAIAssistant({ userProfile, currentStep = 1 }: PersonalizedAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userTier = userProfile.tier
  const tierFeatures = TIER_DEFINITIONS[userTier]?.features?.aiAssistant

  const hasAccess = tierFeatures?.enabled || false
  const dailyLimit = tierFeatures?.dailyMessageLimit || 0
  const hasReachedLimit = messageCount >= dailyLimit

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: generateWelcomeMessage(),
        timestamp: new Date()
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateWelcomeMessage = () => {
    const name = userProfile.name || 'there'
    const location = userProfile.location || 'your area'
    
    return `👋 Hi ${name}! I'm NestQuest, your homebuying guide! I'm here to help you navigate every step of your journey to homeownership in ${location}. What can I help you with today?`
  }

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Step-specific guidance
    if (lowerMessage.includes('pre-approval') || lowerMessage.includes('preapproval')) {
      return `Great question about pre-approval! 📋 Here's what you need to know:\n\n1. Gather your documents (pay stubs, tax returns, bank statements)\n2. Check your credit score - aim for 620+\n3. Compare at least 3 lenders\n4. Get pre-approved (not just pre-qualified!)\n\nBased on your profile, you're looking at homes around ${userProfile.priceRange || '$300k-$400k'}. Need help finding lenders?`
    }
    
    if (lowerMessage.includes('offer') || lowerMessage.includes('bid')) {
      return `Making an offer is exciting! 💰 Here's my NestQuest-guided advice:\n\n1. Research comparable sales in the area\n2. Consider including an escalation clause\n3. Keep your earnest money deposit ready (1-2% of price)\n4. Be prepared to negotiate\n\nRemember: Don't get emotionally attached to ONE house. There are always more fish in the sea! 🐠`
    }
    
    if (lowerMessage.includes('inspection')) {
      return `Home inspections are crucial! 🔍 Here's what to expect:\n\n1. Hire a licensed inspector (budget $300-$500)\n2. Attend the inspection if possible\n3. Review the report carefully\n4. Negotiate repairs or credits\n\nPro tip: Don't skip this step, even if the house looks perfect! Hidden issues can cost you thousands later.`
    }
    
    if (lowerMessage.includes('closing') || lowerMessage.includes('costs')) {
      return `Closing costs typically run 2-5% of your home price. 💵 Here's the breakdown:\n\n• Lender fees (origination, underwriting)\n• Title & escrow fees\n• Appraisal & inspection fees\n• Prepaid taxes & insurance\n• Recording fees\n\nGood news: Some of these are negotiable! Want me to help you estimate your specific costs?`
    }
    
    // Default helpful response
    return `I'm here to guide you! 🧭 I can help with:\n\n• Understanding each step of homebuying\n• Explaining confusing terms\n• Connecting you with resources\n• Keeping you on track\n\nWhat specific aspect of homebuying would you like to explore? Feel free to ask about pre-approval, home search, offers, inspections, or closing!`
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    if (!hasAccess) {
      setShowUpgradePrompt(true)
      return
    }
    
    if (hasReachedLimit) {
      setShowUpgradePrompt(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setMessageCount(prev => prev + 1)

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* Floating Compass Character Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all ${
          hasAccess 
            ? 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]' 
            : 'bg-gray-700'
        } p-4 hover:scale-110`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="compass"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              className="relative"
            >
              <CompassCharacter isActive={hasAccess} expression="happy" />
              {!hasAccess && (
                <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <Crown className="w-3 h-3 text-[#D4AF37] absolute -top-1 -right-1" />
                </div>
              )}
              {hasAccess && (
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header with Compass Character */}
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] p-4 flex items-center gap-3">
              <CompassCharacter isActive={true} expression="happy" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">NestQuest - Your AI Guide</h3>
                <p className="text-cyan-100 text-xs">
                  Step {currentStep} of 8: {HOMEBUYING_STEPS[currentStep - 1]?.name}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800 px-4 py-2">
              <div className="flex gap-1">
                {HOMEBUYING_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex-1 h-2 rounded-full ${
                      idx + 1 <= currentStep ? 'bg-[#06b6d4]' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 flex-shrink-0">
                      <CompassCharacter isActive={false} expression="happy" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#06b6d4] text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-8 h-8">
                    <CompassCharacter isActive={true} expression="thinking" />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-2xl flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              {!hasAccess || hasReachedLimit ? (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-sm text-gray-300">
                    {!hasAccess 
                      ? 'Upgrade to unlock NestQuest AI Guide!' 
                      : `Daily limit reached (${dailyLimit} messages)`}
                  </p>
                  <Link href="/upgrade?feature=aiAssistant">
                    <button className="w-full py-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      Upgrade Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask NestQuest anything..."
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="bg-[#06b6d4] text-white p-2 rounded-lg hover:bg-[#0891b2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
              {hasAccess && !hasReachedLimit && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {dailyLimit === Infinity ? '∞ Unlimited messages' : `${dailyLimit - messageCount} messages left today`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md border-2 border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto">
                  <CompassCharacter isActive={true} expression="excited" />
                </div>
                <h3 className="text-2xl font-bold text-white">Unlock NestQuest AI Guide!</h3>
                <p className="text-gray-300">
                  Get 24/7 personalized guidance through every step of your homebuying journey.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                    <span>Premium: 20 messages/day</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Sparkles className="w-4 h-4 text-[#f97316]" />
                    <span>Pro: 50 messages/day + expert escalation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Pro+: Unlimited messages</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className="flex-1 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  >
                    Maybe Later
                  </button>
                  <Link href="/upgrade?feature=aiAssistant" className="flex-1">
                    <button className="w-full py-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white rounded-lg font-semibold hover:opacity-90 transition-all">
                      Upgrade Now
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
