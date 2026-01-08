/**
 * World Map Levels - Main Game Logic
 * Version 2.0.0
 */

const { createApp } = Vue;
const { createI18n } = VueI18n;

// Continent definitions
const CONTINENTS = {
    'north-america': {
        id: 'north-america',
        name: 'North America',
        icon: '🌎',
        totalCountries: 23,
        countries: ['USA', 'Canada', 'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras',
                   'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Jamaica', 'Haiti',
                   'Dominican Republic', 'Bahamas', 'Trinidad and Tobago', 'Barbados',
                   'Saint Lucia', 'Grenada', 'Saint Vincent and the Grenadines',
                   'Antigua and Barbuda', 'Dominica', 'Saint Kitts and Nevis']
    },
    'south-america': {
        id: 'south-america',
        name: 'South America',
        icon: '🌎',
        totalCountries: 12,
        countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela',
                   'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname']
    },
    'europe': {
        id: 'europe',
        name: 'Europe',
        icon: '🇪🇺',
        totalCountries: 44,
        countries: ['UK', 'Ireland', 'France', 'Germany', 'Italy', 'Spain', 'Portugal',
                   'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Poland', 'Czech Republic',
                   'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Croatia', 'Slovenia',
                   'Serbia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'North Macedonia',
                   'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Estonia', 'Latvia',
                   'Lithuania', 'Belarus', 'Ukraine', 'Moldova', 'Russia', 'Turkey', 'Cyprus',
                   'Luxembourg', 'Malta', 'Andorra', 'Monaco', 'Liechtenstein']
    },
    'africa': {
        id: 'africa',
        name: 'Africa',
        icon: '🌍',
        totalCountries: 54,
        countries: ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'South Sudan',
                   'Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Somalia',
                   'Nigeria', 'Ghana', 'Ivory Coast', 'Senegal', 'Mali', 'Niger', 'Chad',
                   'Cameroon', 'Central African Republic', 'South Africa', 'Zimbabwe', 'Zambia',
                   'Botswana', 'Namibia', 'Mozambique', 'Madagascar', 'Angola', 'DRC',
                   'Republic of the Congo', 'Gabon', 'Equatorial Guinea', 'Mauritania',
                   'Western Sahara', 'Burkina Faso', 'Benin', 'Togo', 'Guinea', 'Sierra Leone',
                   'Liberia', 'Gambia', 'Guinea-Bissau', 'Cape Verde', 'Sao Tome and Principe',
                   'Eritrea', 'Djibouti', 'Malawi', 'Lesotho', 'Eswatini', 'Mauritius', 'Seychelles']
    },
    'asia': {
        id: 'asia',
        name: 'Asia',
        icon: '🌏',
        totalCountries: 48,
        countries: ['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia', 'India',
                   'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan',
                   'Iran', 'Iraq', 'Saudi Arabia', 'Yemen', 'Oman', 'UAE', 'Qatar', 'Bahrain',
                   'Kuwait', 'Jordan', 'Syria', 'Lebanon', 'Israel', 'Palestine', 'Thailand',
                   'Vietnam', 'Myanmar', 'Laos', 'Cambodia', 'Malaysia', 'Singapore', 'Indonesia',
                   'Philippines', 'Brunei', 'Timor-Leste', 'Kazakhstan', 'Uzbekistan',
                   'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Azerbaijan', 'Armenia', 'Georgia',
                   'Maldives', 'Taiwan', 'Hong Kong']
    },
    'oceania': {
        id: 'oceania',
        name: 'Oceania',
        icon: '🌏',
        totalCountries: 14,
        countries: ['Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands',
                   'Vanuatu', 'Samoa', 'Tonga', 'Micronesia', 'Palau', 'Marshall Islands',
                   'Kiribati', 'Nauru', 'Tuvalu']
    },
    'antarctica': {
        id: 'antarctica',
        name: 'Antarctica',
        icon: '🇦🇶',
        totalCountries: 0,
        countries: [],
        note: 'Research stations only - no sovereign countries'
    }
};

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'globe-trotter', name: 'Globe Trotter', icon: '🌟', requirement: 50, type: 'countries', unlocked: false },
    { id: 'continental-master', name: 'Continental Master', icon: '🗺️', requirement: 1, type: 'continent-complete', unlocked: false },
    { id: 'world-citizen', name: 'World Citizen', icon: '🌍', requirement: 6, type: 'continents', unlocked: false },
    { id: 'nomad', name: 'Nomad', icon: '🏠', requirement: 5, type: 'lived', unlocked: false },
    { id: 'backpacker', name: 'Backpacker', icon: '🎒', requirement: 100, type: 'countries', unlocked: false },
    { id: 'ultimate-explorer', name: 'Ultimate Explorer', icon: '👑', requirement: 195, type: 'countries', unlocked: false }
];

// Main Vue App
const app = createApp({
    data() {
        return {
            currentView: 'selector', // 'selector', 'world', or 'continent'
            selectedContinent: null,
            continents: [],
            totalScore: 0,
            countriesVisited: 0,
            continentsCompleted: 0,
            completionPercent: 0,
            achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)),
            mapData: {}, // { 'country-id': level }
            currentLang: 'English'
        };
    },
    mounted() {
        this.loadFromStorage();
        this.initializeContinents();
        this.calculateStats();
        this.setupEventListeners();
    },
    methods: {
        initializeContinents() {
            this.continents = Object.values(CONTINENTS).map(continent => ({
                ...continent,
                score: 0,
                countriesMarked: 0,
                completed: false
            }));
        },

        selectContinent(continentId) {
            this.selectedContinent = continentId;
            this.currentView = 'continent';
            this.loadContinentView(continentId);
        },

        viewWorldMap() {
            this.currentView = 'world';
            this.$nextTick(() => {
                this.loadWorldMap();
            });
        },

        async loadWorldMap() {
            try {
                const response = await fetch('maps/world-summary.svg');
                const svgText = await response.text();
                const container = document.getElementById('world-map-container');
                container.innerHTML = svgText;

                // Color continents based on progress
                this.updateWorldMapColors();

                // Make continents clickable
                document.querySelectorAll('[data-continent]').forEach(element => {
                    element.addEventListener('click', (e) => {
                        const continentId = e.target.dataset.continent;
                        this.selectContinent(continentId);
                    });
                });
            } catch (error) {
                console.error('Error loading world map:', error);
                document.getElementById('world-map-container').innerHTML = `
                    <p style="text-align: center; color: #999;">
                        World map visualization loading...
                    </p>
                `;
            }
        },

        updateWorldMapColors() {
            // Update continent colors based on user progress
            for (const continent of this.continents) {
                const element = document.querySelector(`[data-continent="${continent.id}"]`);
                if (element) {
                    if (continent.completed) {
                        element.setAttribute('data-completed', 'true');
                    } else if (continent.countriesMarked > 0) {
                        element.setAttribute('data-visited', 'true');
                    }
                }
            }
        },

        backToSelector() {
            this.currentView = 'selector';
            this.selectedContinent = null;
        },

        async loadContinentView(continentId) {
            const continent = CONTINENTS[continentId];
            const contentDiv = document.getElementById('continent-content');

            try {
                // Load continent map HTML
                const response = await fetch(`maps/${continentId}.html`);
                const mapHTML = await response.text();
                contentDiv.innerHTML = mapHTML;

                // Color countries based on user progress
                this.updateContinentMapColors();

                // Make countries clickable
                this.setupCountryClickHandlers();

            } catch (error) {
                console.error('Error loading continent map:', error);
                // Fallback to checkbox interface
                contentDiv.innerHTML = `
                    <h2>${continent.icon} ${continent.name}</h2>
                    <p>Countries: ${continent.totalCountries}</p>
                    <div style="text-align: left; max-width: 600px; margin: 20px auto; background: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h3>Countries in ${continent.name}:</h3>
                        <div style="columns: 2; column-gap: 20px;">
                            ${continent.countries.map(country => `
                                <div style="margin: 5px 0;">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" data-country="${country}"
                                               ${this.mapData[country] ? 'checked' : ''}
                                               style="margin-right: 8px;">
                                        ${country}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Add event listeners to checkboxes
                contentDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const country = e.target.dataset.country;
                        if (e.target.checked) {
                            this.setCountryLevel(country, 3);
                        } else {
                            this.setCountryLevel(country, 0);
                        }
                    });
                });
            }
        },

        updateContinentMapColors() {
            // Color countries based on current map data
            document.querySelectorAll('.country-region').forEach(element => {
                const country = element.dataset.country;
                if (country && this.mapData[country]) {
                    element.setAttribute('level', this.mapData[country]);
                } else {
                    element.setAttribute('level', '0');
                }
            });
        },

        setupCountryClickHandlers() {
            document.querySelectorAll('.country-region').forEach(element => {
                element.addEventListener('click', (e) => {
                    const country = e.target.dataset.country;
                    if (country) {
                        this.showLevelSelector(country, e);
                    }
                });
            });
        },

        showLevelSelector(country, event) {
            // Remove any existing selector
            const existing = document.getElementById('level-selector');
            if (existing) existing.remove();

            // Create level selector popup
            const selector = document.createElement('div');
            selector.id = 'level-selector';
            selector.style.cssText = `
                position: fixed;
                background: white;
                border: 3px solid #333;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 200px;
            `;

            const currentLevel = this.mapData[country] || 0;

            selector.innerHTML = `
                <h3 style="margin: 0 0 10px 0; font-size: 16px;">${country}</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="level-btn" data-level="5" style="background: #FF7E7E; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 5 ? 'bold' : 'normal'};">
                        5 - Lived Here
                    </button>
                    <button class="level-btn" data-level="4" style="background: #FFB57E; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 4 ? 'bold' : 'normal'};">
                        4 - Stayed Here
                    </button>
                    <button class="level-btn" data-level="3" style="background: #FFE57E; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 3 ? 'bold' : 'normal'};">
                        3 - Visited Here
                    </button>
                    <button class="level-btn" data-level="2" style="background: #A8FFBE; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 2 ? 'bold' : 'normal'};">
                        2 - Stopped Here
                    </button>
                    <button class="level-btn" data-level="1" style="background: #88AEFF; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 1 ? 'bold' : 'normal'};">
                        1 - Passed Here
                    </button>
                    <button class="level-btn" data-level="0" style="background: #d6beff; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer; font-weight: ${currentLevel === 0 ? 'bold' : 'normal'};">
                        0 - Want to be Here
                    </button>
                    <button class="level-btn" data-level="-1" style="background: #FFF; padding: 10px; border: 2px solid #333; border-radius: 5px; cursor: pointer;">
                        Clear
                    </button>
                </div>
            `;

            // Position near click
            const x = Math.min(event.clientX, window.innerWidth - 250);
            const y = Math.min(event.clientY, window.innerHeight - 400);
            selector.style.left = x + 'px';
            selector.style.top = y + 'px';

            document.body.appendChild(selector);

            // Add click handlers for level buttons
            selector.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = parseInt(btn.dataset.level);
                    if (level === -1) {
                        this.setCountryLevel(country, 0);
                    } else {
                        this.setCountryLevel(country, level);
                    }
                    this.updateContinentMapColors();
                    selector.remove();
                });
            });

            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', function closeSelector(e) {
                    if (!selector.contains(e.target) && e.target.className !== 'country-region') {
                        selector.remove();
                        document.removeEventListener('click', closeSelector);
                    }
                }, { once: true });
            }, 100);
        },

        setCountryLevel(countryId, level) {
            if (level === 0) {
                delete this.mapData[countryId];
            } else {
                this.mapData[countryId] = level;
            }
            this.calculateStats();
            this.saveToStorage();
        },

        calculateStats() {
            // Calculate total score
            this.totalScore = 0;
            this.countriesVisited = 0;
            const levelCounts = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

            for (const country in this.mapData) {
                const level = this.mapData[country];
                if (level > 0) {
                    this.totalScore += level;
                    this.countriesVisited++;
                    levelCounts[level]++;
                }
            }

            // Calculate continent stats
            for (const continent of this.continents) {
                continent.score = 0;
                continent.countriesMarked = 0;

                for (const country of continent.countries) {
                    if (this.mapData[country] && this.mapData[country] > 0) {
                        continent.score += this.mapData[country];
                        continent.countriesMarked++;
                    }
                }

                continent.completed = continent.countriesMarked === continent.totalCountries;
            }

            // Count completed continents
            this.continentsCompleted = this.continents.filter(c => c.completed).length;

            // Calculate completion percentage
            const totalCountries = 195; // Approximate total world countries
            this.completionPercent = Math.round((this.countriesVisited / totalCountries) * 100);

            // Check achievements
            this.checkAchievements(levelCounts);

            // Update title
            document.getElementById('webtitle').textContent = `World Map Levels - Score: ${this.totalScore}`;
        },

        checkAchievements(levelCounts) {
            // Globe Trotter: Visit 50 countries
            if (this.countriesVisited >= 50) {
                this.unlockAchievement('globe-trotter');
            }

            // Continental Master: Complete one continent
            if (this.continents.some(c => c.completed)) {
                this.unlockAchievement('continental-master');
            }

            // World Citizen: Visit countries on all 6 inhabited continents
            const inhabitedContinents = this.continents.filter(c => c.id !== 'antarctica');
            const visitedContinents = inhabitedContinents.filter(c => c.countriesMarked > 0).length;
            if (visitedContinents >= 6) {
                this.unlockAchievement('world-citizen');
            }

            // Nomad: Live in 5+ countries
            if (levelCounts['5'] >= 5) {
                this.unlockAchievement('nomad');
            }

            // Backpacker: Visit 100 countries
            if (this.countriesVisited >= 100) {
                this.unlockAchievement('backpacker');
            }

            // Ultimate Explorer: Visit all 195 countries
            if (this.countriesVisited >= 195) {
                this.unlockAchievement('ultimate-explorer');
            }
        },

        unlockAchievement(achievementId) {
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement && !achievement.unlocked) {
                achievement.unlocked = true;
                this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`);
            }
        },

        showNotification(message) {
            // Simple notification (can be enhanced with a proper notification system)
            console.log(message);
            alert(message);
        },

        saveToStorage() {
            const saveData = {
                mapData: this.mapData,
                achievements: this.achievements,
                timestamp: new Date().toISOString(),
                version: '2.0.0'
            };
            localStorage.setItem('world-map-data', JSON.stringify(saveData));
        },

        loadFromStorage() {
            const saved = localStorage.getItem('world-map-data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.mapData = data.mapData || {};
                    if (data.achievements) {
                        this.achievements = data.achievements;
                    }
                } catch (e) {
                    console.error('Error loading saved data:', e);
                }
            }
        },

        resetAll() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                this.mapData = {};
                this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS));
                this.calculateStats();
                this.saveToStorage();
                alert('All progress has been reset.');
            }
        },

        exportJSON() {
            const exportData = {
                mapData: this.mapData,
                achievements: this.achievements,
                stats: {
                    totalScore: this.totalScore,
                    countriesVisited: this.countriesVisited,
                    continentsCompleted: this.continentsCompleted
                },
                exportDate: new Date().toISOString(),
                version: '2.0.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `world-map-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        },

        importJSON() {
            const input = document.getElementById('importFile');
            input.click();
        },

        handleImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.mapData) {
                        this.mapData = data.mapData;
                    }
                    if (data.achievements) {
                        this.achievements = data.achievements;
                    }
                    this.calculateStats();
                    this.saveToStorage();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing file. Please check the file format.');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        },

        setupEventListeners() {
            // Reset button
            document.getElementById('Reset').addEventListener('click', () => {
                this.resetAll();
            });

            // Export button
            document.getElementById('Export').addEventListener('click', () => {
                this.exportJSON();
            });

            // Import button
            document.getElementById('Import').addEventListener('click', () => {
                this.importJSON();
            });

            // Import file input
            document.getElementById('importFile').addEventListener('change', (e) => {
                this.handleImport(e);
            });

            // Save image button (placeholder)
            document.getElementById('保存').addEventListener('click', () => {
                alert('Image export feature coming soon! Use Export JSON to save your progress.');
            });
        }
    }
});

// Mount the app
app.mount('#app');

// Remove loading state
document.documentElement.removeAttribute('data-loading');
