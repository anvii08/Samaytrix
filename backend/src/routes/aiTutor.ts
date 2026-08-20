import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorizeRole } from '../middleware/authMiddleware';
import { cosineSimilarity, parseEmbedding } from '../utils/vectorSearch';

const router = express.Router();
const prisma = new PrismaClient();

// This is a mock function to simulate getting an embedding for a query from an AI model API
// In a real scenario, you'd call an OpenAI or HuggingFace API here to get the query vector.
async function getQueryEmbedding(query: string): Promise<number[]> {
  // For now, return a dummy vector of 384 dimensions
  return Array(384).fill(0.1); 
}

// Student asks the AI Tutor a question
router.post('/ask', authorizeRole(['Student']), async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const queryVector = await getQueryEmbedding(question);

    // Fetch all knowledge base entries from SQLite
    // (This approach works for local dev. For production with huge data, you'd need a real vector DB)
    const allKbEntries = await prisma.knowledgeBase.findMany();

    // Calculate cosine similarity for all entries in memory
    const scoredEntries = allKbEntries.map(entry => {
      const entryVector = parseEmbedding(entry.embedding);
      const score = entryVector.length > 0 ? cosineSimilarity(queryVector, entryVector) : 0;
      return { ...entry, score };
    });

    // Sort by score descending and take the top 3 results
    scoredEntries.sort((a, b) => b.score - a.score);
    const topResults = scoredEntries.slice(0, 3);

    // Extract context for the AI
    const context = topResults.map(r => r.content).join('\n\n');

    // Here you would normally call a generative AI API (like OpenAI) with the context + question
    // To generate the final response. We'll return a mock response for scaffolding purposes.
    
    const mockAIResponse = `Based on my knowledge:\n\n${context || '(No specific context found)'}\n\nHere is an answer to your question: "${question}"`;

    return res.json({
      answer: mockAIResponse,
      contextUsed: topResults.map(r => ({ id: r.id, title: r.title, score: r.score }))
    });
  } catch (error) {
    console.error('AI Tutor error:', error);
    return res.status(500).json({ error: 'Failed to process question' });
  }
});

export default router;
