"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const vectorSearch_1 = require("../utils/vectorSearch");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// This is a mock function to simulate getting an embedding for a query from an AI model API
// In a real scenario, you'd call an OpenAI or HuggingFace API here to get the query vector.
function getQueryEmbedding(query) {
    return __awaiter(this, void 0, void 0, function* () {
        // For now, return a dummy vector of 384 dimensions
        return Array(384).fill(0.1);
    });
}
// Student asks the AI Tutor a question
router.post('/ask', (0, authMiddleware_1.authorizeRole)(['Student']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }
    try {
        const queryVector = yield getQueryEmbedding(question);
        // Fetch all knowledge base entries from SQLite
        // (This approach works for local dev. For production with huge data, you'd need a real vector DB)
        const allKbEntries = yield prisma.knowledgeBase.findMany();
        // Calculate cosine similarity for all entries in memory
        const scoredEntries = allKbEntries.map(entry => {
            const entryVector = (0, vectorSearch_1.parseEmbedding)(entry.embedding);
            const score = entryVector.length > 0 ? (0, vectorSearch_1.cosineSimilarity)(queryVector, entryVector) : 0;
            return Object.assign(Object.assign({}, entry), { score });
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
    }
    catch (error) {
        console.error('AI Tutor error:', error);
        return res.status(500).json({ error: 'Failed to process question' });
    }
}));
exports.default = router;
