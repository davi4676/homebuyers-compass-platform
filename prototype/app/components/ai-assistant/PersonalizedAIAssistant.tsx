'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Home,
  FileText,
  DollarSign,
  Eye,
  TrendingUp,
  Shield,
  CheckCircle,
  Calendar,
  User,
  ChevronRight,
  Bot,
  Lightbulb,
  Lock,
  Zap,
  Crown
} from 'lucide-react'
import { TIER_DEFINITIONS, hasFeature, type UserTier } from '@/lib/tiers'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  suggestions?: string[]
  stepInfo?: {
    step: number
    title: string
    phase: string
  }
}

interface PersonalizedAIAssistantProps {
  userProfile: {
    name?: string
    buyerType?: string
    location?: string
    priceRange?: string
    downPayment?: number
    creditScore?: number
    timeline?: string
    concerns?: string[]
    tier?: string
  }
  currentStep?: number
  onStepChange?: (step: number) => void
}

// home buying process steps with detailed guidance
const homeBuyingSteps = [
  {
    id: 1,
    title: 'Pre-Approval',
    phase: 'preparation',
    icon: FileText,
    duration: '1-3 days',
    description: 'Get pre-approved for a mortgage to know your buying power',
    keyActions: [
      'Check your credit score',
      'Gather financial documents',
      'Contact 3-5 lenders for quotes',
      'Get pre-approval letter'
    ],
    tips: [
      'Pre-approval shows sellers you\'re serious',
      'Compare rates from multiple lenders',
      'Don\'t make large purchases during this time'
    ]
  },
  {
    id: 2,
    title: 'Find Real Estate Agent',
    phase: 'preparation',
    icon: User,
    duration: '1-2 weeks',
    description: 'Partner with an experienced buyer\'s agent',
    keyActions: [
      'Interview 3-5 agents',
      'Check reviews and credentials',
      'Verify local market experience',
      'Sign buyer representation agreement'
    ],
    tips: [
      'Buyer\'s agent cost is typically covered by seller',
      'Look for agents with recent sales in your target area',
      'Ask about their communication style'
    ]
  },
  {
    id: 3,
    title: 'House Hunting',
    phase: 'search',
    icon: Home,
    duration: '2-12 weeks',
    description: 'Search for and tour potential homes',
    keyActions: [
      'Define your must-haves vs nice-to-haves',
      'Tour homes in person',
      'Attend open houses',
      'Narrow down to top 2-3 properties'
    ],
    tips: [
      'Don\'t fall in love with the first house',
      'Visit neighborhoods at different times',
      'Consider resale value'
    ]
  },
  {
    id: 4,
    title: 'Make an Offer',
    phase: 'negotiation',
    icon: DollarSign,
    duration: '1-3 days',
    description: 'Submit a competitive offer on your chosen home',
    keyActions: [
      'Review comparable sales',
      'Determine your maximum price',
      'Include contingencies',
      'Negotiate terms'
    ],
    tips: [
      'Your agent will guide pricing strategy',
      'Don\'t waive important contingencies',
      'Be prepared for counteroffers'
    ]
  },
  {
    id: 5,
    title: 'Home Inspection',
    phase: 'due-diligence',
    icon: Eye,
    duration: '1-2 weeks',
    description: 'Professional inspection of the property',
    keyActions: [
      'Hire certified home inspector',
      'Attend the inspection',
      'Review inspection report',
      'Request repairs or credits'
    ],
    tips: [
      'Don\'t skip the inspection',
      'Ask questions during the walkthrough',
      'Major issues can be negotiated'
    ]
  },
  {
    id: 6,
    title: 'Appraisal',
    phase: 'due-diligence',
    icon: TrendingUp,
    duration: '1-2 weeks',
    description: 'Lender orders appraisal to verify home value',
    keyActions: [
      'Lender schedules appraisal',
      'Ensure home is accessible',
      'Review appraisal report',
      'Renegotiate if appraisal is low'
    ],
    tips: [
      'Appraisal protects you from overpaying',
      'Low appraisal can affect loan amount',
      'You can challenge appraisal if needed'
    ]
  },
  {
    id: 7,
    title: 'Final Approval',
    phase: 'financing',
    icon: Shield,
    duration: '2-4 weeks',
    description: 'Loan underwriting and final approval',
    keyActions: [
      'Submit all requested documents',
      'Don\'t change jobs or credit',
      'Complete final walkthrough',
      'Review Closing Disclosure'
    ],
    tips: [
      'Respond quickly to lender requests',
      'Keep cash reserves intact',
      'Final walkthrough is your last check'
    ]
  },
  {
    id: 8,
    title: 'Closing Day',
    phase: 'closing',
    icon: CheckCircle,
    duration: '1 day',
    description: 'Sign final documents and get your keys!',
    keyActions: [
      'Review all closing documents',
      'Bring certified funds',
      'Sign paperwork',
      'Receive keys and title'
    ],
    tips: [
      'Bring photo ID and certified check',
      'Take your time reading documents',
      'Congratulations - you\'re a homeowner!'
    ]
  }
]

export default function PersonalizedAIAssistant({ 
  userProfile, 
  currentStep = 1,
  onStepChange 
}: PersonalizedAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(currentStep)
  const [messageCount, setMessageCount] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  // Get user tier and check AI assistant access
  const userTier = (userProfile.tier || 'foundations') as UserTier
  const tierDef = TIER_DEFINITIONS[userTier]
  const aiFeatures = tierDef?.features.aiAssistant || {
    enabled: false,
    tier: 'none',
    dailyMessageLimit: 0,
    contextAwareness: false,
    stepByStepGuidance: false,
    riskWarnings: false,
    financialAdvice: false,
    documentChecklist: false,
    expertEscalation: false,
    proactiveNotifications: false,
  }

  const hasAccess = aiFeatures.enabled
  const dailyLimit = aiFeatures.dailyMessageLimit
  const hasReachedLimit = messageCount >= dailyLimit && dailyLimit !== Infinity

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage()
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // Generate personalized welcome message
  const generateWelcomeMessage = (): Message => {
    const step = homeBuyingSteps[activeStep - 1]
    const name = userProfile.name || 'there'
    
    let content = `👋 Hi ${name}! I'm your personal home buying guide.\n\n`
    
    if (userProfile.buyerType === 'first-time') {
      content += `I see you're a first-time homebuyer - exciting! I'm here to make this process clear and manageable.\n\n`
    }
    
    content += `You're currently at step ${activeStep} of 8: **${step.title}** (${step.phase} phase).\n\n`
    content += `${step.description}\n\n`
    content += `What would you like help with today?`

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      suggestions: [
        `What do I need for ${step.title}?`,
        'Show me all the steps',
        'What are the biggest risks?',
        'How long will this take?'
      ],
      stepInfo: {
        step: activeStep,
        title: step.title,
        phase: step.phase
      }
    }
  }

  // Generate AI response based on user input
  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()
    const step = homeBuyingSteps[activeStep - 1]
    
    let content = ''
    let suggestions: string[] = []

    // Step-specific guidance
    if (lowerMessage.includes('need') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
      content = `**${step.title} - Key Actions:**\n\n`
      step.keyActions.forEach((action, idx) => {
        content += `${idx + 1}. ${action}\n`
      })
      content += `\n**Pro Tips:**\n\n`
      step.tips.forEach(tip => {
        content += `💡 ${tip}\n`
      })
      
      suggestions = [
        'Tell me more about this step',
        'What comes next?',
        'What could go wrong?',
        'Show me a checklist'
      ]
    }
    // Show all steps
    else if (lowerMessage.includes('all step') || lowerMessage.includes('process') || lowerMessage.includes('overview')) {
      content = `**Complete home buying Process (8 Steps):**\n\n`
      homeBuyingSteps.forEach(s => {
        const checkmark = s.id < activeStep ? '✅' : s.id === activeStep ? '🔄' : '⭕'
        content += `${checkmark} **Step ${s.id}: ${s.title}** (${s.duration})\n`
        content += `   ${s.description}\n\n`
      })
      
      suggestions = [
        `Help me with Step ${activeStep}`,
        'What are common mistakes?',
        'How do I stay on track?'
      ]
    }
    // Timeline questions
    else if (lowerMessage.includes('long') || lowerMessage.includes('time') || lowerMessage.includes('timeline')) {
      const totalWeeks = homeBuyingSteps.reduce((sum, s) => {
        const weeks = s.duration.includes('week') 
          ? parseInt(s.duration.split('-')[1] || s.duration.split(' ')[0]) 
          : s.duration.includes('day')
          ? Math.ceil(parseInt(s.duration.split('-')[1] || s.duration.split(' ')[0]) / 7)
          : 4
        return sum + weeks
      }, 0)
      
      content = `**Timeline Overview:**\n\n`
      content += `The complete home buying process typically takes **${totalWeeks} weeks** (about ${Math.round(totalWeeks / 4)} months).\n\n`
      content += `**Current Step:** ${step.title} - ${step.duration}\n\n`
      content += `**Remaining Steps:** ${8 - activeStep} steps\n\n`
      
      if (userProfile.timeline) {
        content += `Based on your target timeline of "${userProfile.timeline}", you're ${
          userProfile.timeline.includes('soon') || userProfile.timeline.includes('3-6')
            ? 'on track'
            : 'ahead of schedule'
        }! 🎯`
      }
      
      suggestions = [
        'How can I speed this up?',
        'What delays should I expect?',
        `Help me with ${step.title}`
      ]
    }
    // Risk/concern questions
    else if (lowerMessage.includes('risk') || lowerMessage.includes('wrong') || lowerMessage.includes('mistake')) {
      content = `**Common Issues at ${step.title}:**\n\n`
      
      if (step.id === 1) {
        content += `⚠️ Getting denied due to credit issues\n`
        content += `⚠️ Not shopping around for best rates\n`
        content += `⚠️ Making large purchases before closing\n`
      } else if (step.id === 3) {
        content += `⚠️ Falling in love with first house\n`
        content += `⚠️ Skipping important locations checks\n`
        content += `⚠️ Not considering resale value\n`
      } else if (step.id === 4) {
        content += `⚠️ Offering too much without comps\n`
        content += `⚠️ Waiving critical contingencies\n`
        content += `⚠️ Not having agent guidance\n`
      } else if (step.id === 5) {
        content += `⚠️ Skipping the inspection to save money\n`
        content += `⚠️ Not attending the inspection\n`
        content += `⚠️ Ignoring major red flags\n`
      } else {
        content += `⚠️ Not responding quickly to requests\n`
        content += `⚠️ Changing financial situation\n`
        content += `⚠️ Missing critical deadlines\n`
      }
      
      content += `\n**How to avoid these:** I can walk you through each action step-by-step.`
      
      suggestions = [
        'Give me a detailed checklist',
        'What should I prioritize?',
        'How do professionals handle this?'
      ]
    }
    // Personalized financial guidance
    else if (lowerMessage.includes('money') || lowerMessage.includes('afford') || lowerMessage.includes('cost')) {
      content = `**Financial Considerations for ${step.title}:**\n\n`
      
      if (userProfile.priceRange) {
        content += `Your target: ${userProfile.priceRange}\n\n`
      }
      
      if (step.id === 1) {
        content += `Pre-approval costs: Usually $0-50 for credit check\n`
        content += `💡 This step helps you know your true buying power\n`
      } else if (step.id === 5) {
        content += `Home inspection cost: $300-500\n`
        content += `💡 Best $500 you'll spend - can save you thousands\n`
      } else if (step.id === 8) {
        content += `Closing costs: Typically 2-5% of purchase price\n`
        if (userProfile.priceRange) {
          const avgPrice = userProfile.priceRange.includes('300') ? 300000 : 400000
          content += `For ${userProfile.priceRange}: ~$${((avgPrice * 0.03) / 1000).toFixed(0)}k-$${((avgPrice * 0.05) / 1000).toFixed(0)}k\n`
        }
      }
      
      suggestions = [
        'Show me ways to save money',
        'What are hidden costs?',
        `Continue with ${step.title}`
      ]
    }
    // Next step
    else if (lowerMessage.includes('next') || lowerMessage.includes('move forward')) {
      if (activeStep < 8) {
        const nextStep = homeBuyingSteps[activeStep]
        content = `Great! Let's move to **Step ${nextStep.id}: ${nextStep.title}**\n\n`
        content += `${nextStep.description}\n\n`
        content += `**Duration:** ${nextStep.duration}\n\n`
        content += `**Key Actions:**\n`
        nextStep.keyActions.forEach((action, idx) => {
          content += `${idx + 1}. ${action}\n`
        })
        
        setActiveStep(activeStep + 1)
        onStepChange?.(activeStep + 1)
        
        suggestions = [
          'Tell me more',
          'What could go wrong here?',
          'Give me a checklist'
        ]
      } else {
        content = `🎉 You're at the final step! After closing, you'll be a homeowner!\n\n`
        content += `**After Closing:**\n`
        content += `✅ Transfer utilities\n`
        content += `✅ Change locks\n`
        content += `✅ Set up home insurance\n`
        content += `✅ Update address everywhere\n`
        
        suggestions = [
          'Show me post-closing checklist',
          'How do I maintain my home?',
          'What about property taxes?'
        ]
      }
    }
    // Default helpful response
    else {
      content = `I can help you with ${step.title}! Here's what you need to know:\n\n`
      content += `**${step.description}**\n\n`
      content += `This typically takes ${step.duration}.\n\n`
      content += `Would you like me to:\n`
      content += `• Walk you through the specific actions?\n`
      content += `• Explain common pitfalls?\n`
      content += `• Show you the complete timeline?\n`
      content += `• Share money-saving tips?`
      
      suggestions = [
        'Walk me through this step',
        'What are the risks?',
        'Show me all steps',
        'How much does this cost?'
      ]
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      suggestions,
      stepInfo: {
        step: activeStep,
        title: step.title,
        phase: step.phase
      }
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Check if user has reached message limit
    if (hasReachedLimit) {
      setShowUpgradePrompt(true)
      return
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setMessageCount(prev => prev + 1)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 800)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    handleSendMessage()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Assistant Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 ${
              hasAccess
                ? 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]'
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            } text-white rounded-full p-4 shadow-2xl hover:shadow-[#06b6d4]/50 transition-all duration-300`}
          >
            <div className="relative">
              {hasAccess ? (
                <>
                  <Bot size={28} />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                </>
              ) : (
                <>
                  <Lock size={28} />
                  <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                </>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-[#06b6d4]/30 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot size={24} className="text-white" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Your AI Guide</h3>
                  <p className="text-xs text-white/80">Step {activeStep} of 8: {homeBuyingSteps[activeStep - 1].title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800 px-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Your Progress</span>
                <span className="text-xs text-[#06b6d4] font-semibold">{Math.round((activeStep / 8) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeStep / 8) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-[#06b6d4] text-white rounded-2xl rounded-tr-sm'
                      : 'bg-gray-700 text-gray-100 rounded-2xl rounded-tl-sm'
                  } p-3 shadow-lg`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-gray-600/50 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-tl-sm p-3 shadow-lg">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-[#06b6d4] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-[#06b6d4] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-[#06b6d4] rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              {!hasAccess ? (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mb-3">
                    <Lock className="mx-auto mb-2 text-orange-400" size={24} />
                    <p className="text-sm text-gray-300 mb-3">
                      Upgrade to <strong className="text-[#06b6d4]">Momentum</strong> or higher to unlock your personal AI assistant
                    </p>
                    <ul className="text-xs text-gray-400 text-left mb-3 space-y-1">
                      <li>✓ 24/7 step-by-step guidance</li>
                      <li>✓ Risk warnings & money-saving tips</li>
                      <li>✓ Context-aware responses</li>
                      <li>✓ Document checklists</li>
                    </ul>
                    <Link
                      href="/upgrade?feature=aiAssistant"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                      <Zap size={16} />
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              ) : hasReachedLimit ? (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-3">
                    <Crown className="mx-auto mb-2 text-yellow-400" size={24} />
                    <p className="text-sm text-gray-300 mb-3">
                      You've reached your daily limit of <strong>{dailyLimit} messages</strong>
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Upgrade to <strong className="text-[#06b6d4]">Concierge+</strong> for {userTier === 'momentum' ? '50 messages/day' : 'unlimited access'}
                    </p>
                    <Link
                      href="/upgrade?feature=aiAssistant"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                      <Zap size={16} />
                      Upgrade for More
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="bg-[#06b6d4] text-white rounded-lg px-4 py-2 hover:bg-[#0891b2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {dailyLimit === Infinity ? 'Unlimited messages' : `${messageCount}/${dailyLimit} messages today`}
                    </p>
                    <p className="text-xs text-[#06b6d4] font-semibold">
                      {aiFeatures.tier.toUpperCase()} tier
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt Modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowUpgradePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-[#06b6d4]/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="text-center">
                <Crown className="mx-auto mb-4 text-yellow-400" size={48} />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {hasAccess ? 'Daily Limit Reached' : 'Unlock AI Assistant'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {hasAccess 
                    ? `You've used all ${dailyLimit} messages for today. Upgrade for more!`
                    : 'Get 24/7 guidance through every step of your home buying journey'
                  }
                </p>

                <div className="bg-gray-800/50 rounded-lg p-6 mb-6 text-left">
                  <h4 className="font-bold text-white mb-3">What you get with an upgrade:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {userTier === 'foundations' && (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span><strong>20 messages/day</strong> with Momentum ($29/mo)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Step-by-step home buying guidance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Risk warnings & common mistake alerts</span>
                        </li>
                      </>
                    )}
                    {userTier === 'momentum' && (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span><strong>50 messages/day</strong> with Concierge ($149 one-time)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Financial advice & savings optimization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Document checklists & proactive notifications</span>
                        </li>
                      </>
                    )}
                    {(userTier === 'navigator' || userTier === 'momentum') && (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span><strong>Unlimited messages</strong> with Concierge+ ($299 one-time)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Expert escalation when you need human help</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                          <span>Priority support & advanced features</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <Link
                    href="/upgrade?feature=aiAssistant"
                    className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    Upgrade Now
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
