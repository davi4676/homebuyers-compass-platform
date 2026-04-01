'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

interface OnboardingFlowProps {
  step: number
  userData: {
    name: string
    zipCode: string
    creditScore: string
    savings: string
    needAgent: boolean
    needLender: boolean
  }
  setUserData: (data: any) => void
  onNext: () => void
  onBack: () => void
  onComplete: () => void
}

export default function OnboardingFlow({
  step,
  userData,
  setUserData,
  onNext,
  onBack,
  onComplete
}: OnboardingFlowProps) {
  const totalSteps = 6

  const onboardingSteps = [
    {
      title: "Hey, I'm NQ! 👋",
      subtitle: "Your Personal Homebuying Guide",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Yo! I'm NQ, and I'm here to guide you through your homebuying journey. Think of me as your pocket expert who's got your back 24/7! 
          </p>
          <p className="text-sm text-gray-300">
            Before we dive in, let me ask you a few quick questions so I can personalize everything just for you. Takes like 60 seconds, promise! 🚀
          </p>
        </div>
      ),
      action: (
        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
        >
          Let's Do This!
          <ArrowRight className="w-4 h-4" />
        </button>
      )
    },
    {
      title: "What should I call you?",
      subtitle: "Step 1 of 6",
      content: (
        <div className="space-y-3">
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            placeholder="Enter your first name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            Don't worry, this stays between us! 🤐
          </p>
        </div>
      ),
      action: (
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!userData.name.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: "Where are you looking?",
      subtitle: "Step 2 of 6",
      content: (
        <div className="space-y-3">
          <input
            type="text"
            value={userData.zipCode}
            onChange={(e) => setUserData({ ...userData, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            placeholder="Enter your ZIP code"
            maxLength={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            This helps me give you local market insights! 📍
          </p>
        </div>
      ),
      action: (
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={userData.zipCode.length !== 5}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: "What's your credit score range?",
      subtitle: "Step 3 of 6",
      content: (
        <div className="space-y-2">
          {['Excellent (740+)', 'Good (670-739)', 'Fair (580-669)', 'Building (<580)', 'Not sure yet'].map((option) => (
            <button
              key={option}
              onClick={() => {
                setUserData({ ...userData, creditScore: option })
                setTimeout(onNext, 300)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                userData.creditScore === option
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <span className="text-sm font-medium">{option}</span>
            </button>
          ))}
          <p className="text-xs text-gray-400 mt-3">
            No judgment! This helps me show you the best loan options 💯
          </p>
        </div>
      ),
      action: (
        <button
          onClick={onBack}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )
    },
    {
      title: "How much have you saved?",
      subtitle: "Step 4 of 6",
      content: (
        <div className="space-y-2">
          {['Under $5K', '$5K - $15K', '$15K - $30K', '$30K - $50K', 'Over $50K', 'Still saving'].map((option) => (
            <button
              key={option}
              onClick={() => {
                setUserData({ ...userData, savings: option })
                setTimeout(onNext, 300)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                userData.savings === option
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <span className="text-sm font-medium">{option}</span>
            </button>
          ))}
          <p className="text-xs text-gray-400 mt-3">
            I'll show you down payment options that match your budget 💰
          </p>
        </div>
      ),
      action: (
        <button
          onClick={onBack}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )
    },
    {
      title: "Do you need help finding...",
      subtitle: "Step 5 of 6",
      content: (
        <div className="space-y-3">
          <button
            onClick={() => setUserData({ ...userData, needAgent: !userData.needAgent })}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
              userData.needAgent
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">🏘️ A Real Estate Agent</span>
              {userData.needAgent && <CheckCircle className="w-5 h-5" />}
            </div>
          </button>
          <button
            onClick={() => setUserData({ ...userData, needLender: !userData.needLender })}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
              userData.needLender
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">💰 A Mortgage Lender</span>
              {userData.needLender && <CheckCircle className="w-5 h-5" />}
            </div>
          </button>
          <p className="text-xs text-gray-400">
            Select all that apply. I'll hook you up with recommendations! 🤝
          </p>
        </div>
      ),
      action: (
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Let's get started",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Perfect, {userData.name}! I now know exactly how to help you. Here's what I'll do:
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Give you personalized advice for the {userData.zipCode} market</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Show loan programs perfect for your credit & budget</span>
            </li>
            {userData.needAgent && (
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Recommend trusted real estate agents in your area</span>
              </li>
            )}
            {userData.needLender && (
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Connect you with competitive mortgage lenders</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Guide you through every step of the journey</span>
            </li>
          </ul>
          <p className="text-sm text-gray-300">
            Ready to find your dream home? Let's go! 🚀🏠
          </p>
        </div>
      ),
      action: (
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Let's Go!
          </button>
        </div>
      )
    }
  ]

  const currentStep = onboardingSteps[step]

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Progress Bar */}
      {step > 0 && (
        <div className="space-y-1">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{step} of {totalSteps}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
        <p className="text-xs text-gray-400">{currentStep.subtitle}</p>
      </div>

      {/* Content */}
      {currentStep.content}

      {/* Action */}
      <div className="pt-2">
        {currentStep.action}
      </div>
    </motion.div>
  )
}
