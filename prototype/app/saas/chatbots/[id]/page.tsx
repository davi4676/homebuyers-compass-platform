'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MessageSquare } from 'lucide-react'
import type { Chatbot } from '@/lib/db/schema'
import EmbeddableChatWidget from '@/components/embed/EmbeddableChatWidget'

export default function ChatbotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Chatbot>>({})
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/chatbots/${id}`)
        if (res.status === 404) {
          if (!cancelled) router.push('/saas/chatbots')
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setChatbot(data)
          setForm({
            name: data.name,
            slug: data.slug,
            description: data.description,
            systemPrompt: data.systemPrompt,
            model: data.model,
            temperature: data.temperature,
            maxTokens: data.maxTokens,
            isPublic: data.isPublic,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, router])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const updated = await res.json()
      setChatbot(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !chatbot) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-stone-500">
        {loading ? 'Loading...' : 'Not found.'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/saas/chatbots"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chatbots
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50"
          >
            <MessageSquare className="w-4 h-4" />
            Preview widget
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">System prompt</label>
              <textarea
                value={form.systemPrompt || ''}
                onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                placeholder="Instructions for the assistant..."
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Model</label>
                <select
                  value={form.model || 'gpt-4'}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Temperature</label>
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={form.temperature ?? 0.7}
                  onChange={(e) => setForm((f) => ({ ...f, temperature: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublic ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="rounded border-stone-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-stone-700">Public (embeddable)</span>
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Preview</h2>
          <p className="text-sm text-stone-500 mb-4">
            Use &quot;Preview widget&quot; to open the embeddable chat in this page.
          </p>
          <div className="rounded-lg border border-stone-200 bg-white p-4 min-h-[200px]">
            <p className="text-sm text-stone-500">Chatbot: {chatbot.name}</p>
            <p className="text-xs text-stone-400 mt-1">ID: {chatbot.id}</p>
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md">
            <EmbeddableChatWidget
              chatbotId={id}
              chatbotName={chatbot.name}
              onClose={() => setPreviewOpen(false)}
              defaultOpen
            />
          </div>
        </div>
      )}
    </div>
  )
}
