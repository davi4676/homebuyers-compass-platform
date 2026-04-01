'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Plus, Settings, MessageSquare } from 'lucide-react'
import type { Chatbot } from '@/lib/db/schema'

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const fetchChatbots = async () => {
    try {
      const res = await fetch('/api/chatbots')
      const data = await res.json()
      setChatbots(data.chatbots || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChatbots()
  }, [])

  const createChatbot = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const created = await res.json()
      if (created.id) {
        setChatbots((prev) => [...prev, created])
        setNewName('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Chatbots</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New chatbot name"
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="button"
            onClick={createChatbot}
            disabled={creating || !newName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : chatbots.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          <Bot className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p>No chatbots yet. Create one above.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((cb) => (
            <li key={cb.id}>
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-stone-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <h2 className="font-semibold text-stone-900">{cb.name}</h2>
                  </div>
                  <Link
                    href={`/saas/chatbots/${cb.id}`}
                    className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>
                {cb.description && <p className="mt-2 text-sm text-stone-500 line-clamp-2">{cb.description}</p>}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/saas/chatbots/${cb.id}`}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Configure & preview
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
