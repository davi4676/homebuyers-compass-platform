import { NextRequest, NextResponse } from 'next/server'
import type { Document, KnowledgeBase } from '@/lib/db/schema'

const docsStore = new Map<string, Document>()
const kbStore = new Map<string, KnowledgeBase>()

export async function GET(request: NextRequest) {
  const kbId = request.nextUrl.searchParams.get('knowledgeBaseId')
  if (kbId) {
    const docs = Array.from(docsStore.values()).filter((d) => d.knowledgeBaseId === kbId)
    return NextResponse.json({ documents: docs })
  }
  const list = Array.from(kbStore.values())
  return NextResponse.json({ knowledgeBases: list })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = (await request.formData()) as unknown as { get(key: string): File | string | null }
      const file = formData.get('file') as File | null
      const knowledgeBaseId = (formData.get('knowledgeBaseId') as string) || `kb_${Date.now()}`
      if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const now = new Date().toISOString()
      const doc: Document = {
        id,
        knowledgeBaseId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }
      docsStore.set(id, doc)
      if (!kbStore.has(knowledgeBaseId)) {
        const existing = Array.from(docsStore.values()).filter((d) => d.knowledgeBaseId === knowledgeBaseId)
        kbStore.set(knowledgeBaseId, {
          id: knowledgeBaseId,
          name: `Knowledge Base ${knowledgeBaseId.slice(-6)}`,
          documentCount: existing.length + 1,
          createdAt: now,
          updatedAt: now,
        })
      }
      return NextResponse.json(doc, { status: 201 })
    }
    const body = await request.json()
    if (body.action === 'createKnowledgeBase') {
      const id = `kb_${Date.now()}`
      const now = new Date().toISOString()
      const kb: KnowledgeBase = {
        id,
        name: body.name || 'New Knowledge Base',
        chatbotId: body.chatbotId,
        documentCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      kbStore.set(id, kb)
      return NextResponse.json(kb, { status: 201 })
    }
    if (body.action === 'ragTraining') {
      const { documentId } = body
      const doc = docsStore.get(documentId)
      if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      doc.status = 'processing'
      setTimeout(() => { doc.status = 'ready'; doc.updatedAt = new Date().toISOString() }, 500)
      return NextResponse.json({ ok: true, message: 'RAG training started' })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
