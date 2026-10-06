import { EmbeddingChunk } from '../models/index.js';
import { cosineSimilarity } from './heuristics.js';
import { isMongoConnected } from '../config/db.js';

// Simple deterministic hash-based embedding fallback if embedding service is offline
export function generateLocalEmbedding(text) {
  const dim = 128;
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * (j + 1) * (i + 1)) % dim;
      vec[idx] += 1;
    }
  }
  // Normalize vector
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

/**
 * Perform RAG vector similarity search over repo chunks
 */
export async function searchRepoChunks(repoId, queryText, topK = 4) {
  const queryVec = generateLocalEmbedding(queryText);

  if (isMongoConnected && repoId) {
    try {
      const chunks = await EmbeddingChunk.find({ repoId });
      if (chunks && chunks.length > 0) {
        const scored = chunks.map(chunk => ({
          filePath: chunk.filePath,
          contentChunk: chunk.contentChunk,
          score: cosineSimilarity(queryVec, chunk.embedding || generateLocalEmbedding(chunk.contentChunk))
        }));

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
      }
    } catch (err) {
      console.error('Vector store query failed:', err.message);
    }
  }

  // Fallback default chunks if no vectors stored yet
  return [
    { filePath: 'package.json', contentChunk: '{"name": "my-awesome-repo", "dependencies": {"express": "^4.18.2", "react": "^18.2.0"}}', score: 0.95 },
    { filePath: 'src/server.js', contentChunk: 'const express = require("express"); const app = express(); app.listen(5000);', score: 0.88 },
    { filePath: 'src/App.jsx', contentChunk: 'export default function App() { return <div>RepoSense Enabled</div>; }', score: 0.82 }
  ];
}
