"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cosineSimilarity = cosineSimilarity;
exports.parseEmbedding = parseEmbedding;
/**
 * Compute the cosine similarity between two vectors.
 * The vectors must be of the same length.
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * Parses a JSON stringified embedding back into a number array.
 */
function parseEmbedding(embeddingStr) {
    try {
        return JSON.parse(embeddingStr);
    }
    catch (e) {
        console.error('Failed to parse embedding:', e);
        return [];
    }
}
