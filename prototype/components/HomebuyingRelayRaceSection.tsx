'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Clock,
  Cog,
  DollarSign,
  Eye,
  Scale,
  ScrollText,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'

const buyerSteps = [
  { id: 1, emoji: '📝', title: 'Get Pre-Approved', description: 'Bank says "You can play!"', color: 'from-blue-400 to-cyan-400', borderColor: 'border-blue-400/50' },
  { id: 2, emoji: '🤝', title: 'Find a Real Estate Agent', description: 'Team up with a homebuying expert', color: 'from-indigo-400 to-blue-400', borderColor: 'border-indigo-400/50' },
  { id: 3, emoji: '🔍', title: 'Find Your Home', description: 'House hunting with your agent', color: 'from-purple-400 to-pink-400', borderColor: 'border-purple-400/50' },
  { id: 4, emoji: '💌', title: 'Make Offer', description: 'Say "I want this house!"', color: 'from-red-400 to-rose-400', borderColor: 'border-red-400/50' },
  { id: 5, emoji: '✅', title: 'Inspect & Appraise', description: 'House gets a health check', color: 'from-green-400 to-emerald-400', borderColor: 'border-green-400/50' },
  { id: 6, emoji: '✍️', title: 'Get Final Approval', description: 'Lender gives final green light!', color: 'from-teal-400 to-cyan-400', borderColor: 'border-teal-400/50' },
  { id: 7, emoji: '📚', title: 'Sign Papers', description: 'Sign your name 100 times', color: 'from-yellow-400 to-amber-400', borderColor: 'border-yellow-400/50' },
  { id: 8, emoji: '🎉', title: 'Get Keys!', description: 'Move in day!', color: 'from-green-500 to-emerald-500', borderColor: 'border-green-500/50' },
]

const businessProcesses = [
  { id: 1, icon: Building2, title: 'Loan Approval Factory', who: 'Mortgage Lender', what: 'Deep financial check', duration: '3-6 weeks', fee: '$500-$2,000', color: 'from-orange-500 to-amber-500', borderColor: 'border-orange-500/50' },
  { id: 2, icon: TrendingUp, title: 'Value Detective', who: 'Certified Appraiser', what: 'Determines house worth', duration: '1-2 weeks', fee: '$300-$600', color: 'from-yellow-500 to-amber-500', borderColor: 'border-yellow-500/50' },
  { id: 3, icon: Eye, title: 'House Doctor Visit', who: 'Home Inspector', what: 'Full physical exam', duration: '2-4 hours', fee: '$300-$500', color: 'from-green-500 to-emerald-500', borderColor: 'border-green-500/50' },
  { id: 4, icon: ScrollText, title: 'History Investigator', who: 'Title Company', what: 'Checks 100 years of ownership', duration: '1-3 weeks', fee: '$500-$1,000 + insurance', color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-500/50' },
  { id: 5, icon: Users, title: 'Negotiation & Paperwork Pros', who: 'Real Estate Agents', what: 'Marketing, offers, contracts', duration: 'Entire process', fee: 'Paid by seller at closing', color: 'from-purple-500 to-pink-500', borderColor: 'border-purple-500/50' },
  { id: 6, icon: Scale, title: 'The Big Money Move', who: 'Settlement Agent', what: 'Final signing & fund transfer', duration: '1 day', fee: '$1,500-$3,000', color: 'from-red-500 to-rose-500', borderColor: 'border-red-500/50' },
  { id: 7, icon: Shield, title: 'Protection Policy', who: 'Insurance Company', what: "Homeowner's insurance (required!)", duration: 'Ongoing', fee: '$800-$2,000/year', color: 'from-teal-500 to-cyan-500', borderColor: 'border-teal-500/50' },
]

export default function HomebuyingRelayRaceSection() {
  return (
    <>
      {/* The Homebuying Relay Race section */}
      <motion.section
        id="homebuying-process-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="text-center mb-12 font-sans">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[rgb(var(--navy))] tracking-tight">
            The Homebuying Relay Race 🏃‍♂️
          </h2>
          <p className="text-lg text-[rgb(var(--text-muted))] max-w-3xl mx-auto mb-6 leading-relaxed">
            6-7 separate companies must work together perfectly
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 bg-[rgb(var(--sky-mid))] border border-slate-200 rounded-2xl p-6 text-center max-w-4xl mx-auto font-sans"
        >
          <p className="text-lg text-[rgb(var(--navy))] mb-2 font-medium">
            <strong className="text-[rgb(var(--coral))]">Did you know?</strong> Buying a house requires <strong>6-7 separate companies</strong> to work together perfectly.
          </p>
          <p className="text-base text-[rgb(var(--text-muted))] italic mb-4">
            That&apos;s why it feels like herding cats! 🐱
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white rounded-xl px-5 py-3 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-[rgb(var(--navy))]">$3,000–$7,000+</div>
              <div className="text-xs font-medium text-[rgb(var(--text-muted))]">Total Business Costs</div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-[rgb(var(--navy))]">6–7</div>
              <div className="text-xs font-medium text-[rgb(var(--text-muted))]">Separate Companies</div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-[rgb(var(--navy))]">30–45</div>
              <div className="text-xs font-medium text-[rgb(var(--text-muted))]">Days Average</div>
            </div>
          </div>
        </motion.div>

        {/* Desktop: two columns - Omio light */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 mb-8 font-sans">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-[rgb(var(--navy))] tracking-tight">
              🎮 WHAT YOU SEE<br />
              <span className="text-lg font-normal text-[rgb(var(--text-muted))]">The NestQuest Adventure</span>
            </h3>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />
              <div className="space-y-6 relative z-10">
                {buyerSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-3xl shadow-md border-2 ${step.borderColor}`}>
                      {step.emoji}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="text-xs font-bold text-[rgb(var(--text-muted))] mb-1">STEP {step.id}</div>
                      <h4 className="text-lg font-bold text-[rgb(var(--navy))] mb-1">{step.title}</h4>
                      <p className="text-sm text-[rgb(var(--text-muted))]">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-[rgb(var(--navy))] tracking-tight">
              ⚙️ WHAT&apos;S HAPPENING<br />
              <span className="text-lg font-normal text-[rgb(var(--text-muted))]">The Business Machine</span>
            </h3>
            <div className="space-y-4">
              {businessProcesses.map((process, index) => {
                const Icon = process.icon
                return (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${process.color} flex items-center justify-center shadow-md`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Cog className="text-[rgb(var(--text-muted))]" size={14} />
                          <span className="text-xs font-bold text-[rgb(var(--text-muted))]">GEAR {process.id}</span>
                        </div>
                        <h4 className="text-base font-bold text-[rgb(var(--navy))] mb-1">{process.title}</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[rgb(var(--text-muted))]">Who:</span>
                            <span className="text-[rgb(var(--navy))] font-semibold">{process.who}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[rgb(var(--text-muted))]">What:</span>
                            <span className="text-[rgb(var(--navy))]">{process.what}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="text-[rgb(var(--text-muted))]" size={12} />
                            <span className="text-[rgb(var(--text-muted))]">{process.duration}</span>
                            <span className="text-[rgb(var(--text-muted))]">•</span>
                            <DollarSign className="text-[rgb(var(--text-muted))]" size={12} />
                            <span className="text-[rgb(var(--text-muted))]">{process.fee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Mobile/Tablet: stacked - Omio light */}
        <div className="lg:hidden space-y-8 font-sans">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-6 text-center text-[rgb(var(--navy))] tracking-tight">
              🎮 WHAT YOU SEE: The NestQuest Adventure
            </h3>
            <div className="space-y-4">
              {buyerSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shadow-md border-2 ${step.borderColor}`}>
                    {step.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[rgb(var(--text-muted))] mb-1">STEP {step.id}</div>
                    <h4 className="text-base font-bold text-[rgb(var(--navy))] mb-1">{step.title}</h4>
                    <p className="text-sm text-[rgb(var(--text-muted))]">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-6 text-center text-[rgb(var(--navy))] tracking-tight">
              ⚙️ WHAT&apos;S HAPPENING: The Business Machine
            </h3>
            <div className="space-y-4">
              {businessProcesses.map((process, index) => {
                const Icon = process.icon
                return (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${process.color} flex items-center justify-center shadow-md`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Cog className="text-[rgb(var(--text-muted))]" size={12} />
                          <span className="text-xs font-bold text-[rgb(var(--text-muted))]">GEAR {process.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[rgb(var(--navy))] mb-1">{process.title}</h4>
                        <div className="space-y-1 text-xs">
                          <div><span className="text-[rgb(var(--text-muted))]">Who: </span><span className="text-[rgb(var(--navy))]">{process.who}</span></div>
                          <div><span className="text-[rgb(var(--text-muted))]">What: </span><span className="text-[rgb(var(--navy))]">{process.what}</span></div>
                          <div className="flex items-center gap-2">
                            <Clock className="text-[rgb(var(--text-muted))]" size={10} />
                            <span className="text-[rgb(var(--text-muted))]">{process.duration}</span>
                            <span className="text-[rgb(var(--text-muted))]">•</span>
                            <DollarSign className="text-[rgb(var(--text-muted))]" size={10} />
                            <span className="text-[rgb(var(--text-muted))]">{process.fee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
