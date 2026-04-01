/**
 * Simple keyword-based retrieval for RAG.
 * Returns chunks with sufficient word overlap (no embeddings).
 */

import { getAllChunks, type KnowledgeChunk } from './knowledge-base'

const SIMILARITY_THRESHOLD = 0.25 // Tune as needed; simple keyword overlap
const MAX_CHUNKS = 4

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  )
}

function overlapScore(queryTokens: Set<string>, chunk: KnowledgeChunk): number {
  const chunkTokens = tokenize(`${chunk.text} ${chunk.keywords.join(' ')}`)
  if (chunkTokens.size === 0) return 0
  let matches = 0
  for (const t of queryTokens) {
    if (chunkTokens.has(t)) matches++
    // Also match keywords
    for (const k of chunk.keywords) {
      if (k.includes(t) || t.includes(k.toLowerCase())) {
        matches++
        break
      }
    }
  }
  return matches / Math.max(queryTokens.size, 1)
}

/**
 * Retrieve up to MAX_CHUNKS chunks relevant to the query.
 * Returns empty array if no chunks meet threshold — bot must say it lacks info.
 */
export function retrieveChunks(query: string): KnowledgeChunk[] {
  const queryTokens = tokenize(query)
  if (queryTokens.size === 0) return []

  const chunks = getAllChunks()
  const scored = chunks.map((chunk) => ({
    chunk,
    score: overlapScore(queryTokens, chunk),
  }))

  const filtered = scored
    .filter((s) => s.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CHUNKS)

  return filtered.map((s) => s.chunk)
}
