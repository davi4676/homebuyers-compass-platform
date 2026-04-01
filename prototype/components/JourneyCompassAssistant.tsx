'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, Lock, ArrowRight, Crown, Zap } from 'lucide-react'
import Link from 'next/link'
import { type UserTier, TIER_DEFINITIONS, TIER_ORDER } from '@/lib/tiers'
import OnboardingFlow from './OnboardingFlow'

interface JourneyCompassAssistantProps {
  currentTier: UserTier
  currentPhase?: string
  externalOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function JourneyCompassAssistant({ 
  currentTier,
  currentPhase = 'preparation',
  externalOpen,
  onOpenChange
}: JourneyCompassAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [userData, setUserData] = useState({
    name: '',
    zipCode: '',
    creditScore: '',
    savings: '',
    needAgent: false,
    needLender: false
  })

  // Sync with external control
  useEffect(() => {
    console.log('JourneyCompassAssistant: externalOpen changed to', externalOpen)
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen)
      console.log('JourneyCompassAssistant: setIsOpen called with', externalOpen)
    }
  }, [externalOpen])

  const effectiveOpen = externalOpen !== undefined ? externalOpen : isOpen

  useEffect(() => {
    console.log('JourneyCompassAssistant: effectiveOpen is', effectiveOpen, 'externalOpen:', externalOpen, 'isOpen:', isOpen)
  }, [effectiveOpen, externalOpen, isOpen])

  const handleToggle = () => {
    const newState = !effectiveOpen
    console.log('JourneyCompassAssistant: handleToggle called, new state:', newState)
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  // Tier-specific features
  const tierFeatures: Record<
    UserTier,
    {
      maxQuestions: number
      canAskCustom: boolean
      detailLevel: string
      features: string[]
    }
  > = {
    foundations: {
      maxQuestions: 3,
      canAskCustom: false,
      detailLevel: 'basic',
      features: ['Basic guidance', 'Phase overviews', '3 quick tips'],
    },
    momentum: {
      maxQuestions: 10,
      canAskCustom: true,
      detailLevel: 'detailed',
      features: ['Detailed guidance', 'Custom questions', 'Step-by-step tips', 'Document checklists'],
    },
    navigator: {
      maxQuestions: Infinity,
      canAskCustom: true,
      detailLevel: 'comprehensive',
      features: ['Unlimited guidance', 'Expert insights', 'Personalized strategies', 'Priority support'],
    },
    navigator_plus: {
      maxQuestions: Infinity,
      canAskCustom: true,
      detailLevel: 'comprehensive',
      features: ['Unlimited guidance', 'Expert insights', 'Crowdfunding strategies', 'Dedicated support'],
    },
  }

  const features = tierFeatures[currentTier]

  // Phase-specific questions
  const phaseQuestions: Record<string, { question: string; answer: string; tier: UserTier }[]> = {
    preparation: [
      {
        question: "How do I check my credit score?",
        answer:
          'Check your credit at AnnualCreditReport.com (free, no credit card). Aim for at least 620+ on many loans, 630+ for more options; 740+ for the best rates.',
        tier: 'foundations'
      },
      {
        question: "What documents do I need?",
        answer: "You'll need: 2 years of tax returns, 2 months of pay stubs, 2 months of bank statements, photo ID, and proof of any other income. Start gathering these now to speed up pre-approval!",
        tier: 'foundations'
      },
      {
        question: "How can I improve my credit quickly?",
        answer: "Pay down credit card balances below 30% utilization, become an authorized user on someone's good credit card, dispute any errors on your report, and avoid new credit inquiries. These can boost your score in 30-60 days!",
        tier: 'momentum'
      },
      {
        question: "What's the ideal down payment percentage?",
        answer: "It depends! 20% avoids PMI, but 3-5% down is common with first-time buyer programs. With your profile, I'd recommend focusing on conventional loans with 5% down to balance affordability and equity building.",
        tier: 'navigator'
      }
    ],
    'pre-approval': [
      {
        question: "What's the difference between pre-qualification and pre-approval?",
        answer: "Pre-qualification is an estimate based on what you tell the lender. Pre-approval involves a credit check and document verification - it's much stronger! Sellers take pre-approval seriously. In today's market, you need to jump when you see a house you love - pre-approval lets you do that!",
        tier: 'foundations'
      },
      {
        question: "Should I shop around for lenders?",
        answer: "ABSOLUTELY! This is critical. Just like you'll tour many houses, check out various mortgage lenders. Different providers offer different rates, loan types, and fees. Get quotes from at least 3 lenders within 14 days (counts as one credit inquiry). Rates can vary by 0.25-0.5% - that's $50-100/month on a $300K loan! Given you'll likely be paying for 30 years, shopping around is one of the most important steps.",
        tier: 'foundations'
      },
      {
        question: "How do I negotiate better loan terms?",
        answer: "Play lenders against each other! Use the Rate Comparison Opener: 'Hi, I've been researching and [Competitor Bank] is offering [specific rate]. I'd prefer to work with you because of [reason]. Would you be able to match or beat that rate?' Or try the Pre-Approval Leverage: 'I've been pre-approved by another lender at [rate] with [terms], but wanted to check with you. What's the best package you could offer?' Be specific, professional, and have data ready!",
        tier: 'momentum'
      },
      {
        question: "What do I say when they give me their first offer?",
        answer: "Don't accept immediately! Use the Thoughtful Consideration Script: 'Thank you for that offer. The rate seems a bit higher than I was hoping for based on current market conditions. I understand you have guidelines, but is there any flexibility on the [rate/closing costs/terms]? I'm really hoping to work with you, but need to make sure I'm getting competitive terms.' This acknowledges their position while firmly requesting better terms.",
        tier: 'momentum'
      },
      {
        question: "How do I negotiate fees specifically?",
        answer: "Use the Fee Breakdown Script: 'I notice there's a [specific fee] of [$X] on this estimate. Could you help me understand what this covers? And is this fee negotiable or something that could be reduced?' Or the Competitor Fee Comparison: 'I've received another loan estimate that doesn't include [specific fee] or has a lower [application/processing] fee. Would you be willing to waive or reduce these fees to help make your offer more competitive?'",
        tier: 'navigator'
      },
      {
        question: "What if I have credit issues or special circumstances?",
        answer: "Use the Financial Strength Script: 'While I had [credit issue] in [timeframe], I want to highlight that I've maintained [positive financial behavior] for [time period]. My current financial situation includes [strengths: high down payment, substantial assets, excellent income-to-debt ratio]. How might these factors help me qualify for better terms?' This acknowledges concerns while redirecting focus to your strengths.",
        tier: 'navigator'
      },
      {
        question: "How do I close the deal when we're close?",
        answer: "Use the Final Push Script: 'I appreciate all the work you've done to get us to this point. We're very close to where I need to be to move forward. If you can [make specific adjustment: reduce the rate by X%, waive this fee, etc.], I'm prepared to move forward with you today. Is that something you could do?' This creates a clear path to closing while asking for one final concession.",
        tier: 'navigator'
      },
      {
        question: "What should I know about my finances before shopping?",
        answer: "Know where you stand! Lenders look at credit score, debt-to-income ratio, and loan-to-value ratio. A high credit score and healthy savings put you in the best position to negotiate. Don't be afraid to check your credit - knowledge is power! Homebuyers with excellent credit scores are sometimes in the best position to negotiate.",
        tier: 'momentum'
      },
      {
        question: "How can I use my Readiness Score in negotiations?",
        answer: "Your Readiness Score is a powerful negotiation tool! If your score is 70+, mention it: 'My readiness score is [X], which shows strong financial preparedness across credit, DTI, down payment, and timeline. How can we translate this into better rates or reduced fees?' Lenders value low-risk borrowers - a high readiness score positions you as qualified and serious. Use it when shopping for rates and negotiating closing costs!",
        tier: 'momentum'
      },
      {
        question: "Can I negotiate closing costs?",
        answer: "Yes! Closing costs are usually 3-4% of the loan amount. Loan origination fees, application fees, and title insurance are most likely negotiable. Property taxes and credit check costs are less likely to change. When shopping, ask for specifics regarding interest rates AND closing costs - having all rates and fees itemized strengthens your position. Find a better deal? Ask your loan officer to lower or waive some fees!",
        tier: 'navigator'
      },
      {
        question: "Should I get pre-approved with multiple lenders?",
        answer: "YES! It's a good idea to get pre-approved with more than one lender so you know upfront where the best deal lies. Based on your financial profile, loan programs you qualify for can vary widely between lenders. The goal? Feel confident when you sign at closing. The informed homebuyer who shops around usually negotiates better!",
        tier: 'navigator'
      }
    ],
    'house-hunting': [
      {
        question: "How do I find a good real estate agent?",
        answer: "Look for agents with 5+ years experience in your target neighborhood, ask for references, check their recent sales, and interview at least 3 before deciding. A great agent is worth their weight in gold!",
        tier: 'foundations'
      },
      {
        question: "What should I look for during showings?",
        answer: "Beyond aesthetics, check: foundation cracks, water damage signs, roof age, HVAC age, electrical panel, plumbing, neighborhood noise levels, and cell phone signal. Take photos and notes!",
        tier: 'momentum'
      },
      {
        question: "How do I spot a good deal vs overpaying?",
        answer: "Compare price per sq ft in the neighborhood, check recent comps within 0.5 miles, analyze days on market, look at price history, and factor in needed repairs. I can help you run a detailed comp analysis!",
        tier: 'navigator'
      }
    ],
    negotiation: [
      {
        question: "How much should I offer below asking price?",
        answer: "In a balanced market, 3-5% below asking is reasonable. But it depends on: days on market, comparable sales, home condition, and local competition. Never lowball a well-priced home in a hot market!",
        tier: 'foundations'
      },
      {
        question: "What contingencies should I include?",
        answer: "Always include: inspection contingency (7-10 days), financing contingency, and appraisal contingency. In hot markets, you might waive appraisal gap but NEVER skip inspection!",
        tier: 'momentum'
      },
      {
        question: "How do I win in a multiple offer situation?",
        answer: "Strategies: escalation clause (offer $X above highest bid up to $Y), larger earnest money, shorter inspection period, appraisal gap coverage, and a personal letter. Script: 'We're very interested and pre-approved for [X]. We're prepared to offer [Y] with escalation up to [Z], plus [larger earnest money/flexible closing] to show commitment.'",
        tier: 'navigator'
      },
      {
        question: "How do I negotiate repairs after inspection?",
        answer: "Be specific and collaborative. Script: 'We're still interested, but inspection revealed [specific issues]. We'd like to work together - would you be open to [seller repairs/price reduction/seller credit]? We want to move forward but need to address these items.' Stay professional, not confrontational!",
        tier: 'momentum'
      }
    ],
    underwriting: [
      {
        question: "What is underwriting?",
        answer: "Underwriting is when the lender verifies everything: your income, assets, credit, and the property value. They're making sure you can afford the loan and the house is worth what you're paying. It takes 2-4 weeks.",
        tier: 'foundations'
      },
      {
        question: "What can I do to speed up underwriting?",
        answer: "Respond immediately to document requests, don't make large purchases or deposits, don't change jobs, keep your credit stable, and maintain your bank account balances. Quick responses = faster closing!",
        tier: 'momentum'
      },
      {
        question: "What if the appraisal comes in low?",
        answer: "Options: 1) Negotiate price down, 2) Split the difference with seller, 3) Bring more cash to closing, 4) Challenge the appraisal with comps, 5) Walk away. Pro members get my appraisal challenge template and negotiation scripts!",
        tier: 'navigator'
      }
    ],
    closing: [
      {
        question: "What happens at closing?",
        answer: "You'll sign a LOT of documents (plan for 1-2 hours), review the final closing disclosure, wire your down payment + closing costs, and get the keys! Bring your ID and celebrate - you're a homeowner!",
        tier: 'foundations'
      },
      {
        question: "What are typical closing costs?",
        answer: "Expect 2-5% of the purchase price: origination fees, appraisal, title insurance, escrow fees, recording fees, and prepaid taxes/insurance. On a $300K home, that's $6K-$15K. Some costs are negotiable!",
        tier: 'momentum'
      },
      {
        question: "How can I reduce my closing costs?",
        answer: "Strategies: ask seller for concessions (up to 6% of price), shop for title insurance, negotiate lender fees, close mid-month to reduce prepaid interest, and compare settlement companies. Use this script: 'While reviewing the loan estimate, I noticed fees for [specific fee]. Given my strong credit profile, I'd like to see if there's room to reduce or waive these costs. If we can adjust, I'm ready to proceed immediately.'",
        tier: 'navigator'
      },
      {
        question: "Can I negotiate fees at closing?",
        answer: "Yes! Loan origination fees, application fees, and title insurance are most negotiable. Script: 'Given my strong credit profile and that I'm a committed borrower, I'd like to see if there's room to reduce or waive [specific fee]. If we can make that adjustment, I'm ready to proceed immediately.' Be specific, professional, and have data ready!",
        tier: 'momentum'
      }
    ]
  }

  const currentQuestions = phaseQuestions[currentPhase] || phaseQuestions.preparation

  const getLockedQuestionsCount = () => {
    return currentQuestions.filter((q) => TIER_ORDER.indexOf(q.tier) > TIER_ORDER.indexOf(currentTier)).length
  }

  const isQuestionLocked = (questionTier: UserTier) => {
    return TIER_ORDER.indexOf(questionTier) > TIER_ORDER.indexOf(currentTier)
  }

  return (
    <>
      {/* Floating Assistant Button - Mobile/Fallback */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-8 right-8 z-40 lg:hidden"
      >
        <motion.button
          onClick={handleToggle}
          className="relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Compass Character */}
          <div className="relative w-20 h-20">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            
            {/* Compass body */}
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-4 border-white">
              {/* Compass face */}
              <svg viewBox="0 0 100 100" className="w-16 h-16">
                {/* Compass circle */}
                <circle cx="50" cy="50" r="45" fill="white" opacity="0.95"/>
                
                {/* Compass directions */}
                <text x="50" y="20" fontSize="12" fontWeight="bold" fill="#1e293b" textAnchor="middle">N</text>
                <text x="50" y="88" fontSize="12" fontWeight="bold" fill="#1e293b" textAnchor="middle">S</text>
                <text x="15" y="55" fontSize="12" fontWeight="bold" fill="#1e293b" textAnchor="middle">W</text>
                <text x="85" y="55" fontSize="12" fontWeight="bold" fill="#1e293b" textAnchor="middle">E</text>
                
                {/* Compass needle */}
                <motion.g
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: '50% 50%' }}
                >
                  <polygon points="50,30 55,50 50,55 45,50" fill="#ef4444"/>
                  <polygon points="50,70 55,50 50,45 45,50" fill="#3b82f6"/>
                  <circle cx="50" cy="50" r="4" fill="#1e293b"/>
                </motion.g>
                
                {/* Happy face */}
                <circle cx="42" cy="45" r="2" fill="#1e293b"/>
                <circle cx="58" cy="45" r="2" fill="#1e293b"/>
                <motion.path
                  d="M 42 52 Q 50 58 58 52"
                  stroke="#1e293b"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  animate={{ d: ["M 42 52 Q 50 58 58 52", "M 42 52 Q 50 60 58 52", "M 42 52 Q 50 58 58 52"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>
            
            {/* Arms */}
            <motion.div
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-3 top-8 w-8 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              style={{ transformOrigin: 'right center' }}
            ></motion.div>
            <motion.div
              animate={{ rotate: [0, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute -right-3 top-8 w-8 h-2 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
              style={{ transformOrigin: 'left center' }}
            ></motion.div>
            
            {/* Legs */}
            <motion.div
              animate={{ scaleY: [1, 0.8, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-5 -bottom-2 w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"
            ></motion.div>
            <motion.div
              animate={{ scaleY: [1, 0.8, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute right-5 -bottom-2 w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"
            ></motion.div>
          </div>
          
          {/* Notification badge */}
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {currentQuestions.length - getLockedQuestionsCount()}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {effectiveOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                onOpenChange?.(false)
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Chat Window - Next to NQ */}
            <motion.div
              initial={{ opacity: 0, y: -10, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, x: -20, scale: 0.95 }}
              className="fixed top-32 md:top-36 left-4 md:left-8 w-[420px] md:w-[480px] max-w-[calc(100vw-2rem)] bg-gray-900 rounded-2xl shadow-2xl border-2 border-purple-500/30 z-50 max-h-[75vh] overflow-hidden flex flex-col"
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-8 h-8">
                    <circle cx="50" cy="50" r="45" fill="#f1f5f9"/>
                    <text x="50" y="20" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">N</text>
                    <polygon points="50,30 53,50 50,52 47,50" fill="#ef4444"/>
                    <polygon points="50,70 53,50 50,48 47,50" fill="#3b82f6"/>
                    <circle cx="50" cy="50" r="3" fill="#1e293b"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    NQ
                    <span className="text-xs">✨</span>
                  </h3>
                  <p className="text-xs text-blue-100">Your Journey Guide</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onOpenChange?.(false)
                }}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {showOnboarding ? (
                /* Onboarding Flow */
                <OnboardingFlow 
                  step={onboardingStep}
                  userData={userData}
                  setUserData={setUserData}
                  onNext={() => setOnboardingStep(onboardingStep + 1)}
                  onBack={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                  onComplete={() => {
                    localStorage.setItem('nqOnboarding', JSON.stringify(userData))
                    setShowOnboarding(false)
                    setOnboardingStep(0)
                  }}
                />
              ) : (
                <>
                  {/* Personalized Welcome */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-3 border border-blue-500/30"
                  >
                    <p className="text-sm text-gray-200">
                      Hey {userData.name || 'there'}! 👋 I'm NQ, your personal homebuying guide. 
                      {userData.zipCode && ` I see you're looking in the ${userData.zipCode} area.`}
                      {userData.creditScore && ` With your credit profile, I've got some great options for you!`}
                      {' '}Let's make this journey smooth! 🏠✨
                    </p>
                  </motion.div>

                  {/* Personalized Recommendations */}
                  {(userData.needAgent || userData.needLender) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30"
                    >
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        Recommendations for You
                      </h4>
                      {userData.needAgent && (
                        <div className="text-xs text-gray-300 mb-2">
                          🏘️ <strong>Real Estate Agent:</strong> I recommend finding a buyer's agent with 5+ years in your area. They're free (seller pays!) and can save you thousands.
                        </div>
                      )}
                      {userData.needLender && (
                        <div className="text-xs text-gray-300">
                          💰 <strong>Mortgage Lender:</strong> Based on your profile, I suggest getting quotes from at least 3 lenders. Want me to help you compare?
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Questions */}
                  {currentQuestions.map((item, index) => {
                const locked = isQuestionLocked(item.tier)
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => !locked && setSelectedQuestion(selectedQuestion === item.question ? null : item.question)}
                      disabled={locked}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        locked
                          ? 'bg-gray-800/50 border border-gray-700 cursor-not-allowed opacity-60'
                          : selectedQuestion === item.question
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400'
                          : 'bg-gray-800 border border-gray-700 hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-200">{item.question}</span>
                        {locked ? (
                          <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      
                      {locked && (
                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          Requires {TIER_DEFINITIONS[item.tier].name}
                        </div>
                      )}
                    </button>

                    {/* Answer */}
                    <AnimatePresence>
                      {selectedQuestion === item.question && !locked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-green-500/30"
                        >
                          <p className="text-sm text-gray-300 leading-relaxed">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}

              {/* Upsell for lower tiers */}
              {(currentTier === 'foundations' || currentTier === 'momentum') && getLockedQuestionsCount() > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border-2 border-yellow-500/50 mt-4"
                >
                  <div className="flex items-start gap-3">
                    <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white mb-1">
                        {getLockedQuestionsCount()} Expert Tips Locked
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">
                        Upgrade to access detailed guidance, custom questions, and expert strategies that could save you thousands!
                      </p>
                      <Link
                        href="/upgrade?feature=aiAssistant"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all text-sm"
                      >
                        <Zap className="w-4 h-4" />
                        Upgrade Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tier features */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Your Current Features:</h4>
                <ul className="space-y-1">
                  {features.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
                </>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
