'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import {
  getPhaseReengagementPrompt,
  markPhaseReengagementModalShown,
  schedulePhaseReminder,
  type PhaseReminderDelay,
} from '@/lib/phase-reengagement'
import { trackActivity } from '@/lib/track-activity'

type PhaseReengagementModalProps = {
  phaseOrder: number
  onClose: () => void
}

const OPTIONS: { id: PhaseReminderDelay; label: string }[] = [
  { id: '1w', label: '1 week' },
  { id: '2w', label: '2 weeks' },
  { id: '1m', label: '1 month' },
  { id: 'dismiss', label: 'No reminder' },
]

export default function PhaseReengagementModal({ phaseOrder, onClose }: PhaseReengagementModalProps) {
  const prompt = getPhaseReengagementPrompt(phaseOrder)
  const [selected, setSelected] = useState<PhaseReminderDelay>(prompt?.defaultDelay ?? '2w')

  if (!prompt) return null

  const handleSave = () => {
    const reminder = schedulePhaseReminder(phaseOrder, selected)
    trackActivity('tool_used', {
      tool: 'phase_reengagement_reminder',
      phaseOrder,
      delay: selected,
    })
    if (reminder && selected !== 'dismiss' && typeof window !== 'undefined') {
      try {
        const email = localStorage.getItem('quizLeadEmail')?.trim()
        if (email) {
          void fetch('/api/phase-reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...reminder, email }),
          })
        }
      } catch {
        /* ignore */
      }
    }
    onClose()
  }

  const handleDismiss = () => {
    markPhaseReengagementModalShown(phaseOrder)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[135] flex items-end justify-center bg-slate-900/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phase-reminder-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          <Bell className="mt-1 h-6 w-6 shrink-0 text-teal-600" aria-hidden />
          <div>
            <h2 id="phase-reminder-title" className="font-display text-lg font-bold text-slate-900">
              {prompt.headline}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{prompt.subline}</p>
          </div>
        </div>
        <fieldset className="mt-5">
          <legend className="sr-only">Reminder timing</legend>
          <div className="grid grid-cols-2 gap-2">
            {OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition ${
                  selected === opt.id
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="reminder-delay"
                  value={opt.id}
                  checked={selected === opt.id}
                  onChange={() => setSelected(opt.id)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={handleSave}
          className="mt-5 w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          Save reminder
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">Reminders appear in your Inbox when they are due.</p>
      </div>
    </div>
  )
}
