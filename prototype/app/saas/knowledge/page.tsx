'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Upload, FileText, Loader2 } from 'lucide-react'

type KnowledgeBase = { id: string; name: string; documentCount: number; createdAt: string }
type Document = { id: string; knowledgeBaseId: string; name: string; type: string; size: number; status: string }

export default function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newKbName, setNewKbName] = useState('')
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null)
  const [ragTraining, setRagTraining] = useState<string | null>(null)

  const fetchKbs = async () => {
    try {
      const res = await fetch('/api/knowledge')
      const data = await res.json()
      setKbs(data.knowledgeBases || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchDocs = async (kbId: string | null) => {
    if (!kbId) {
      setDocs([])
      return
    }
    try {
      const res = await fetch(`/api/knowledge?knowledgeBaseId=${kbId}`)
      const data = await res.json()
      setDocs(data.documents || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    (async () => {
      await fetchKbs()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    fetchDocs(selectedKbId || null)
  }, [selectedKbId])

  const createKb = async () => {
    if (!newKbName.trim()) return
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createKnowledgeBase', name: newKbName.trim() }),
      })
      const kb = await res.json()
      if (kb.id) {
        setKbs((prev) => [...prev, kb])
        setNewKbName('')
        setSelectedKbId(kb.id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedKbId) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('knowledgeBaseId', selectedKbId)
      const res = await fetch('/api/knowledge', { method: 'POST', body: formData })
      const doc = await res.json()
      if (doc.id) {
        setDocs((prev) => [...prev, doc])
        fetchKbs()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const startRagTraining = async (docId: string) => {
    setRagTraining(docId)
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ragTraining', documentId: docId }),
      })
      await fetchDocs(selectedKbId || null)
    } catch (e) {
      console.error(e)
    } finally {
      setRagTraining(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Knowledge Base</h1>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Create knowledge base</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newKbName}
            onChange={(e) => setNewKbName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-500"
          />
          <button
            type="button"
            onClick={createKb}
            disabled={!newKbName.trim()}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Bases</h2>
          {loading ? (
            <p className="text-stone-500">Loading...</p>
          ) : kbs.length === 0 ? (
            <p className="text-stone-500">Create one above.</p>
          ) : (
            <ul className="space-y-2">
              {kbs.map((kb) => (
                <li key={kb.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedKbId(kb.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                      selectedKbId === kb.id ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    {kb.name}
                    <span className="text-xs text-stone-500 ml-auto">{kb.documentCount} docs</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Documents</h2>
          {!selectedKbId ? (
            <p className="text-stone-500">Select a knowledge base.</p>
          ) : (
            <>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer mb-4">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload file'}
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.pdf"
                  onChange={uploadFile}
                  disabled={uploading}
                />
              </label>
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-stone-200"
                  >
                    <FileText className="w-4 h-4 text-stone-500" />
                    <span className="text-sm text-stone-800 flex-1 truncate">{doc.name}</span>
                    <span className="text-xs text-stone-500">{doc.status}</span>
                    {doc.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => startRagTraining(doc.id)}
                        disabled={ragTraining === doc.id}
                        className="text-xs px-2 py-1 rounded bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50"
                      >
                        {ragTraining === doc.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Start RAG'
                        )}
                      </button>
                    )}
                  </li>
                ))}
                {docs.length === 0 && <p className="text-stone-500 text-sm">No documents. Upload a file.</p>}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
