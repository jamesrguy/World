/**
 * Vercel Serverless Function - High Scores API
 *
 * Endpoints:
 * GET  /api/scores - Get leaderboard
 * POST /api/scores - Submit new score
 */

import { validateScore, generateHash } from './lib/validation.js';

// In-memory storage (replace with database in production)
let scores = [];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // GET - Retrieve leaderboard
  if (req.method === 'GET') {
    const { limit = 100, offset = 0, continent = 'all' } = req.query;

    let filteredScores = [...scores];

    // Filter by continent if specified
    if (continent !== 'all') {
      filteredScores = filteredScores.filter(
        score => score.continentsCompleted.includes(continent)
      );
    }

    // Sort by total score (descending)
    filteredScores.sort((a, b) => b.totalScore - a.totalScore);

    // Paginate
    const paginatedScores = filteredScores.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // Add rank
    const rankedScores = paginatedScores.map((score, index) => ({
      ...score,
      rank: parseInt(offset) + index + 1
    }));

    return res.status(200).json({
      scores: rankedScores,
      total: filteredScores.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }

  // POST - Submit new score
  if (req.method === 'POST') {
    try {
      const {
        nickname,
        email,
        totalScore,
        countriesVisited,
        continentsCompleted,
        mapData
      } = req.body;

      // Validate required fields
      if (!nickname || !totalScore || !mapData) {
        return res.status(400).json({
          error: 'Missing required fields: nickname, totalScore, mapData'
        });
      }

      // Validate score integrity
      const isValid = validateScore(mapData, totalScore);
      if (!isValid) {
        return res.status(400).json({
          error: 'Score validation failed. Score does not match map data.'
        });
      }

      // Generate verification hash
      const verificationHash = generateHash(
        nickname,
        mapData,
        Date.now(),
        process.env.VERIFICATION_SECRET || 'default-secret'
      );

      // Create score entry
      const scoreEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nickname: nickname.substring(0, 50), // Limit nickname length
        email: email ? hashEmail(email) : null,
        totalScore: parseInt(totalScore),
        countriesVisited: parseInt(countriesVisited) || 0,
        continentsCompleted: continentsCompleted || [],
        completionPercentage: (countriesVisited / 195) * 100,
        mapData: JSON.stringify(mapData), // Store as string
        timestamp: new Date().toISOString(),
        verificationHash,
        isVerified: true
      };

      // Add to scores array
      scores.push(scoreEntry);

      // Limit to top 1000 scores to prevent memory issues
      if (scores.length > 1000) {
        scores.sort((a, b) => b.totalScore - a.totalScore);
        scores = scores.slice(0, 1000);
      }

      return res.status(201).json({
        success: true,
        id: scoreEntry.id,
        rank: calculateRank(scoreEntry.totalScore),
        message: 'Score submitted successfully!'
      });

    } catch (error) {
      console.error('Error submitting score:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Calculate rank for a given score
 */
function calculateRank(score) {
  const higherScores = scores.filter(s => s.totalScore > score);
  return higherScores.length + 1;
}

/**
 * Hash email for privacy (simple implementation)
 */
function hashEmail(email) {
  // In production, use proper crypto.createHash
  return Buffer.from(email).toString('base64');
}
