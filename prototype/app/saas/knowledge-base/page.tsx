'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

const LS_KEY = 'nq_saas_kb_articles_v1'

type Article = { id: string; title: string; category: string; updated: string; content?: string }

const SEED_ARTICLES: Article[] = [
  { id: 'a1', title: 'FHA vs. conventional — quick comparison', category: 'Loan types', updated: '2026-03-28' },
  { id: 'a2', title: 'How DTI affects pre-approval', category: 'Qualification', updated: '2026-03-25' },
  { id: 'a3', title: 'Closing cost line items explained', category: 'Closing', updated: '2026-03-20' },
  { id: 'a4', title: 'First-time buyer assistance programs', category: 'Programs', updated: '2026-03-15' },
  { id: 'a5', title: 'Rate locks and float-down policies', category: 'Rates', updated: '2026-03-10' },
]

function loadArticles(): Article[] {
  if (typeof window === 'undefined') return SEED_ARTICLES
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return SEED_ARTICLES
    const parsed = JSON.parse(raw) as Article[]
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_ARTICLES
  } catch {
    return SEED_ARTICLES
  }
}

function saveArticles(articles: Article[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(articles))
  } catch {
    // ignore
  }
}

export default function SaasKnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES)
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setArticles(loadArticles())
    setHydrated(true)
  }, [])

  const persist = useCallback((next: Article[]) => {
    setArticles(next)
    saveArticles(next)
  }, [])

  const addArticle = () => {
    if (!title.trim()) return
    const next: Article = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: 'Custom',
      updated: new Date().toISOString().slice(0, 10),
      content: content.trim() || undefined,
    }
    persist([next, ...articles])
    setTitle('')
    setContent('')
    setModal(false)
  }

  return (
    <div>
      <Link
        href="/saas"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Knowledge Base</h1>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Add Article
        </button>
      </div>

      {!hydrated ? (
        <p className="text-stone-500">Loading…</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white shadow-sm">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl">
              <div className="flex gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-stone-900">{a.title}</p>
                  <p className="text-sm text-stone-500">
                    {a.category} · Last updated {a.updated}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kb-modal-title"
          onClick={() => setModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="kb-modal-title" className="text-lg font-bold text-stone-900">
              Add article
            </h2>
            <label className="mt-4 block text-sm font-medium text-stone-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
              placeholder="Article title"
            />
            <label className="mt-4 block text-sm font-medium text-stone-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
              placeholder="Body text (stored locally for demo)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addArticle}
                disabled={!title.trim()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
