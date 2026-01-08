/**
 * Score validation and verification utilities
 */

import crypto from 'crypto';

/**
 * Points per level
 */
const POINTS_PER_LEVEL = {
  '0': 0,  // Never been / Want to be
  '1': 1,  // Passed
  '2': 2,  // Stopped
  '3': 3,  // Visited
  '4': 4,  // Stayed
  '5': 5,  // Lived
};

/**
 * Validate that the score matches the map data
 *
 * @param {Object} mapData - Country-level data
 * @param {Number} claimedScore - Claimed total score
 * @returns {Boolean} - True if valid
 */
export function validateScore(mapData, claimedScore) {
  try {
    let calculatedScore = 0;

    // Calculate score from map data
    for (const country in mapData) {
      const level = mapData[country];

      // Validate level is in range
      if (!['0', '1', '2', '3', '4', '5', '-'].includes(String(level))) {
        console.error(`Invalid level for ${country}: ${level}`);
        return false;
      }

      // Add to score (treat '-' as 0)
      const normalizedLevel = level === '-' ? '0' : String(level);
      calculatedScore += POINTS_PER_LEVEL[normalizedLevel] || 0;
    }

    // Check if calculated matches claimed
    const isValid = calculatedScore === parseInt(claimedScore);

    if (!isValid) {
      console.error(`Score mismatch: calculated ${calculatedScore}, claimed ${claimedScore}`);
    }

    return isValid;
  } catch (error) {
    console.error('Error validating score:', error);
    return false;
  }
}

/**
 * Generate verification hash for score submission
 *
 * @param {String} nickname - User nickname
 * @param {Object} mapData - Country-level data
 * @param {Number} timestamp - Submission timestamp
 * @param {String} secret - Server secret key
 * @returns {String} - SHA256 hash
 */
export function generateHash(nickname, mapData, timestamp, secret) {
  const data = `${nickname}${JSON.stringify(mapData)}${timestamp}${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify a score submission hash
 *
 * @param {String} hash - Submitted hash
 * @param {String} nickname - User nickname
 * @param {Object} mapData - Country-level data
 * @param {Number} timestamp - Submission timestamp
 * @param {String} secret - Server secret key
 * @returns {Boolean} - True if hash is valid
 */
export function verifyHash(hash, nickname, mapData, timestamp, secret) {
  const expectedHash = generateHash(nickname, mapData, timestamp, secret);
  return hash === expectedHash;
}

/**
 * Calculate statistics from map data
 *
 * @param {Object} mapData - Country-level data
 * @returns {Object} - Statistics object
 */
export function calculateStats(mapData) {
  const stats = {
    totalScore: 0,
    countriesVisited: 0,
    continentsCompleted: [],
    levelCounts: {
      '5': 0, // Lived
      '4': 0, // Stayed
      '3': 0, // Visited
      '2': 0, // Stopped
      '1': 0, // Passed
      '0': 0, // Never/Want
    }
  };

  for (const country in mapData) {
    const level = String(mapData[country] === '-' ? '0' : mapData[country]);

    // Count by level
    if (stats.levelCounts.hasOwnProperty(level)) {
      stats.levelCounts[level]++;
    }

    // Count as visited if level > 0
    if (level !== '0') {
      stats.countriesVisited++;
    }

    // Add to total score
    stats.totalScore += POINTS_PER_LEVEL[level] || 0;
  }

  return stats;
}
