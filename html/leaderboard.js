/**
 * Leaderboard Logic for World Map Levels
 * Version 2.0.0
 */

let currentFilter = 'all-time';
let leaderboardData = [];
let userData = null;

// Load user's data from localStorage
function loadUserData() {
    const saved = localStorage.getItem('world-map-data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            userData = {
                mapData: data.mapData || {},
                achievements: data.achievements || [],
                timestamp: data.timestamp
            };

            // Calculate stats
            let totalScore = 0;
            let countriesVisited = 0;

            for (const country in userData.mapData) {
                const level = userData.mapData[country];
                if (level > 0) {
                    totalScore += level;
                    countriesVisited++;
                }
            }

            userData.totalScore = totalScore;
            userData.countriesVisited = countriesVisited;

            // Update modal display
            document.getElementById('playerScore').textContent = `${totalScore} points`;
            document.getElementById('playerCountries').textContent = `${countriesVisited} countries`;

        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// Fetch leaderboard from API
async function fetchLeaderboard(filter = 'all-time') {
    try {
        const response = await fetch(`/api/scores?filter=${filter}&limit=100`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        return data.scores || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Return mock data if API fails
        return getMockLeaderboard();
    }
}

// Mock leaderboard data (for development/demo)
function getMockLeaderboard() {
    return [
        {
            rank: 1,
            nickname: 'GlobeTrekker',
            totalScore: 847,
            countriesVisited: 178,
            continentsCompleted: 7,
            completionPercentage: 91.3,
            achievements: ['🌟', '🗺️', '🌍', '🏠', '🎒', '👑']
        },
        {
            rank: 2,
            nickname: 'WorldWanderer',
            totalScore: 723,
            countriesVisited: 156,
            continentsCompleted: 6,
            completionPercentage: 80.0,
            achievements: ['🌟', '🗺️', '🌍', '🎒']
        },
        {
            rank: 3,
            nickname: 'TravelNinja',
            totalScore: 654,
            countriesVisited: 142,
            continentsCompleted: 6,
            completionPercentage: 72.8,
            achievements: ['🌟', '🗺️', '🌍', '🎒']
        },
        {
            rank: 4,
            nickname: 'MapMaster',
            totalScore: 589,
            countriesVisited: 128,
            continentsCompleted: 6,
            completionPercentage: 65.6,
            achievements: ['🌟', '🗺️', '🎒']
        },
        {
            rank: 5,
            nickname: 'ExplorerPro',
            totalScore: 512,
            countriesVisited: 115,
            continentsCompleted: 5,
            completionPercentage: 59.0,
            achievements: ['🌟', '🎒']
        },
        {
            rank: 6,
            nickname: 'AdventureSeeker',
            totalScore: 467,
            countriesVisited: 98,
            continentsCompleted: 5,
            completionPercentage: 50.3,
            achievements: ['🌟']
        },
        {
            rank: 7,
            nickname: 'CountryCollector',
            totalScore: 423,
            countriesVisited: 89,
            continentsCompleted: 5,
            completionPercentage: 45.6,
            achievements: ['🌟']
        },
        {
            rank: 8,
            nickname: 'PassportStamps',
            totalScore: 398,
            countriesVisited: 81,
            continentsCompleted: 4,
            completionPercentage: 41.5,
            achievements: ['🌟']
        },
        {
            rank: 9,
            nickname: 'JetSetter',
            totalScore: 367,
            countriesVisited: 74,
            continentsCompleted: 4,
            completionPercentage: 37.9,
            achievements: ['🌟']
        },
        {
            rank: 10,
            nickname: 'NomadLife',
            totalScore: 334,
            countriesVisited: 68,
            continentsCompleted: 4,
            completionPercentage: 34.9,
            achievements: []
        }
    ];
}

// Render leaderboard
function renderLeaderboard(scores) {
    const content = document.getElementById('leaderboard-content');

    if (!scores || scores.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <h3>No scores yet!</h3>
                <p>Be the first to submit your score and claim the top spot!</p>
            </div>
        `;
        return;
    }

    content.innerHTML = scores.map(player => {
        const rankClass = player.rank === 1 ? 'gold' : player.rank === 2 ? 'silver' : player.rank === 3 ? 'bronze' : '';
        const rowClass = player.rank <= 3 ? 'top-3' : '';

        return `
            <div class="leaderboard-row ${rowClass}">
                <div class="rank ${rankClass}">${player.rank}</div>
                <div class="player-name">
                    ${player.nickname}
                    ${player.achievements ? `<span class="achievement-badge">${player.achievements.join(' ')}</span>` : ''}
                </div>
                <div class="stat"><strong>${player.totalScore}</strong></div>
                <div class="stat">${player.countriesVisited}</div>
                <div class="stat hide-mobile">${player.continentsCompleted}/7</div>
                <div class="stat hide-mobile">${player.completionPercentage}%</div>
            </div>
        `;
    }).join('');
}

// Open submit modal
function openSubmitModal() {
    if (!userData || !userData.totalScore) {
        alert('Please play the game first before submitting your score!\n\nVisit the World Map to start marking countries.');
        return;
    }

    document.getElementById('submitModal').classList.add('active');
}

// Close submit modal
function closeSubmitModal() {
    document.getElementById('submitModal').classList.remove('active');
}

// Submit score to API
async function submitScore() {
    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!nickname) {
        alert('Please enter a nickname!');
        return;
    }

    if (!userData || !userData.totalScore) {
        alert('No game data found! Please play the game first.');
        return;
    }

    // Prepare submission data
    const submission = {
        nickname: nickname,
        email: email || null,
        totalScore: userData.totalScore,
        countriesVisited: userData.countriesVisited,
        mapData: userData.mapData,
        achievements: userData.achievements,
        timestamp: new Date().toISOString()
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submission)
        });

        if (!response.ok) {
            throw new Error('Failed to submit score');
        }

        const result = await response.json();

        // Success!
        alert(`🎉 Score submitted successfully!\n\nYour rank: #${result.rank || '?'}\n\nThank you for participating!`);
        closeSubmitModal();

        // Refresh leaderboard
        loadLeaderboard(currentFilter);

    } catch (error) {
        console.error('Error submitting score:', error);
        alert('⚠️ Unable to submit score at this time.\n\nThe leaderboard feature is currently in development. Your score is saved locally!\n\nTry again later when the API is deployed.');
    } finally {
        // Reset button
        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.textContent = 'Submit Score';
        submitBtn.disabled = false;
    }
}

// Load and display leaderboard
async function loadLeaderboard(filter = 'all-time') {
    currentFilter = filter;

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    // Show loading state
    document.getElementById('leaderboard-content').innerHTML = '<div class="loading">Loading leaderboard...</div>';

    // Fetch and render
    const scores = await fetchLeaderboard(filter);
    renderLeaderboard(scores);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadLeaderboard('all-time');

    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadLeaderboard(btn.dataset.filter);
        });
    });

    // Close modal on outside click
    document.getElementById('submitModal').addEventListener('click', (e) => {
        if (e.target.id === 'submitModal') {
            closeSubmitModal();
        }
    });
});
