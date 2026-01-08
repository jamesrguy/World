# World Map Levels - Claude.md

## Project Overview

**World Map Levels** is an interactive web-based geography game where users mark countries they've visited across all continents. The game features a progressive continent-by-continent gameplay experience with a global high-scores leaderboard.

## Core Features

### 🌍 Global Coverage
- **Complete World Map**: Covers all continents in sequence
- **Countries Only**: Focuses on sovereign nations (US states removed in favor of country-level tracking)
- **Continent Progression**: Play through each continent sequentially:
  1. North America
  2. South America
  3. Europe
  4. Africa
  5. Asia
  6. Oceania
  7. Antarctica (research stations/territories)

### 🎮 Enhanced Gameplay

#### 6-Level Involvement System
Users classify their relationship with each country:

| Level | Color | Name | Points | Description |
|-------|-------|------|--------|-------------|
| 5 | Red | Lived Here | 5 pts | Resided in the country |
| 4 | Orange | Stayed Here | 4 pts | Overnight accommodation |
| 3 | Yellow | Visited Here | 3 pts | Visited the location |
| 2 | Green | Stopped Here | 2 pts | Brief stop/transit |
| 1 | Light Blue | Passed Here | 1 pt | Traveled through |
| 0 | Purple | Want to be Here | 0 pts | Bucket list item |

#### Game Flow
1. **Continent Selection**: Start with any continent or play in sequence
2. **Interactive Marking**: Click countries to mark involvement level
3. **Real-time Scoring**: See your continent score update instantly
4. **Continent Completion**: Receive continent completion badge
5. **World Map Finale**: After completing all continents, view full world map with all marked countries
6. **Final Score**: Calculate total global involvement score (max: ~975 points for 195 countries)

### 🏆 High-Scores Board

#### Features
- **Global Leaderboard**: Top 100 players worldwide
- **Scoring Metrics**:
  - Total Points
  - Countries Visited Count
  - Continents Completed
  - Completion Percentage
- **User Profiles**: Display nickname, flag, and achievement badges
- **Filters**:
  - All-time scores
  - Monthly champions
  - Filter by continent
- **Social Sharing**: Share your rank and world map on social media

#### Leaderboard Storage
- Backend API for persistent high-scores storage
- Anti-cheat validation (verifies score calculations)
- Rate limiting to prevent spam submissions
- Optional user authentication for verified accounts

### 💾 Data Persistence

- **Local Storage**: Automatic progress saving in browser
- **Export Options**:
  - PNG image export of your world map
  - JSON data export for backup
  - Share link generation with embedded data
- **Import**: Restore progress from JSON backup or share link

### 🌐 Internationalization

Supports 8+ languages:
- English
- 简体中文 (Simplified Chinese)
- 繁體中文 (Traditional Chinese)
- 日本語 (Japanese)
- Français (French)
- Español (Spanish)
- Dansk (Danish)
- עברית (Hebrew)

## Technical Architecture

### Frontend Stack
- **Vue 3**: Reactive UI framework
- **Vue I18n**: Multi-language support
- **HTML5 Canvas**: Map rendering and image export
- **SVG**: Interactive country boundaries
- **Vanilla JavaScript**: Core game logic
- **CSS3**: Responsive styling

### Backend Services
- **Vercel Serverless Functions**: High-scores API endpoints
- **Vercel KV/PostgreSQL**: Leaderboard data storage
- **Vercel Edge Network**: Global CDN for fast loading

### API Endpoints

```
POST   /api/scores          - Submit new score
GET    /api/scores          - Retrieve leaderboard (with pagination)
GET    /api/scores/:userId  - Get user's score history
POST   /api/verify          - Verify score integrity
```

### Database Schema

```javascript
{
  id: UUID,
  nickname: String,
  email: String (optional, hashed),
  totalScore: Integer,
  countriesVisited: Integer,
  continentsCompleted: Integer,
  completionPercentage: Float,
  mapData: JSON, // Encrypted country-level data
  timestamp: DateTime,
  verificationHash: String,
  isVerified: Boolean
}
```

## File Structure

```
/home/user/World/
├── html/
│   ├── world.html           # Main world game interface
│   ├── world.js             # Core game logic
│   ├── continents/          # Individual continent modules
│   │   ├── north-america.js
│   │   ├── south-america.js
│   │   ├── europe.js
│   │   ├── africa.js
│   │   ├── asia.js
│   │   └── oceania.js
│   ├── leaderboard.html     # High-scores interface
│   ├── leaderboard.js       # Leaderboard logic
│   └── document.css         # Global styles
├── api/                     # Vercel serverless functions
│   ├── scores.js            # CRUD operations for scores
│   ├── verify.js            # Score verification
│   └── lib/
│       ├── db.js            # Database connection
│       └── validation.js    # Input validation
├── public/
│   ├── maps/                # SVG map files
│   │   ├── world.svg
│   │   └── [continent].svg
│   └── fonts/
│       └── slice.woff       # Multi-language font
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies
└── Claude.md                # This file
```

## Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository linked to Vercel
- Environment variables configured

### Environment Variables
```bash
DATABASE_URL=          # PostgreSQL connection string
KV_REST_API_URL=       # Vercel KV URL (optional)
KV_REST_API_TOKEN=     # Vercel KV token (optional)
VERIFICATION_SECRET=   # Secret for score hashing
ENABLE_AUTH=true       # Enable user authentication
```

### Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Link Project**:
   ```bash
   vercel link
   ```

3. **Configure Environment**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add VERIFICATION_SECRET
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Automatic Deployments
- **Production**: Pushes to `main` branch auto-deploy
- **Preview**: Pull requests generate preview deployments
- **Branch**: Feature branches deploy to unique URLs

### Performance Optimization
- **Edge Functions**: Leaderboard API deployed to edge for low latency
- **Static Assets**: Maps and fonts served via Vercel CDN
- **Compression**: Gzip/Brotli compression enabled
- **Caching**:
  - Static assets: 1 year cache
  - Leaderboard API: 5-minute cache
  - User scores: No cache

## Game Mechanics Deep Dive

### Scoring Algorithm

```javascript
// Total score calculation
totalScore = Σ(countryLevel × pointsPerLevel)

// Bonus points
continentBonus = completedContinents × 10
achievementBonus = calculateAchievements()

// Final score
finalScore = totalScore + continentBonus + achievementBonus
```

### Achievements System

Unlock special badges:
- 🌟 **Globe Trotter**: Visit 50 countries
- 🗺️ **Continental Master**: Complete all countries in one continent
- 🌍 **World Citizen**: Visit countries on all 6 inhabited continents
- 🏠 **Nomad**: Live (level 5) in 5+ countries
- 🎒 **Backpacker**: Visit 100 countries
- 👑 **Ultimate Explorer**: Visit all 195 countries

### Anti-Cheat Measures

1. **Score Verification Hash**:
   ```javascript
   hash = SHA256(userId + mapData + timestamp + secret)
   ```

2. **Server-Side Validation**:
   - Recalculate score from submitted map data
   - Compare with claimed score
   - Reject if mismatch detected

3. **Rate Limiting**:
   - Max 10 submissions per hour per IP
   - Exponential backoff for repeated submissions

4. **Data Integrity**:
   - Validate country codes against ISO 3166-1
   - Check for impossible combinations
   - Flag suspicious patterns

## User Experience

### Mobile Responsiveness
- Touch-optimized country selection
- Responsive map scaling
- Swipe gestures for continent navigation
- Bottom sheet UI for mobile menus

### Accessibility
- Screen reader support for map regions
- Keyboard navigation (Tab, Enter, Arrow keys)
- High contrast mode
- Adjustable font sizes
- ARIA labels for all interactive elements

### Performance
- **Load Time**: < 2 seconds (including maps)
- **First Contentful Paint**: < 1 second
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: 95+ (Performance)

## Future Enhancements

### Planned Features
- [ ] Social features (friends, comparisons)
- [ ] Animated progression visualizations
- [ ] Historical travel timeline
- [ ] Travel statistics and insights
- [ ] Integration with travel APIs (TripAdvisor, Google Maps)
- [ ] Collaborative maps (family/group tracking)
- [ ] Photo attachments to countries
- [ ] Travel journal integration
- [ ] Challenge mode (time-based quizzes)
- [ ] AR mode (view map in augmented reality)

### Community Requests
- Ability to mark specific cities within countries
- Region-level detail for large countries
- Custom level definitions
- Private leaderboards for friend groups
- Export to other formats (PDF, SVG, GeoJSON)

## Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally: `vercel dev`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Translation Contributions
Help us add more languages! Edit the language files in `/html/world.js` and submit a PR.

### Map Improvements
If you notice inaccurate country boundaries, please submit corrections with sources.

## License

MIT License - See LICENSE file for details.

## Support

- **Issues**: https://github.com/[repo]/issues
- **Discussions**: https://github.com/[repo]/discussions
- **Email**: support@maplevels.com

## Credits

### Original Project
Based on "Map Levels" by tenpages:
- US States version: https://tenpages.github.io/us-level/us.html
- Europe version: https://tenpages.github.io/us-level/eu.html

### Inspired By
- https://lab.magiconch.com/china-ex/
- https://zhung.com.tw/japanex/

### Contributors
- Translation contributors (see git history)
- Map data: Natural Earth
- Fonts: Google Fonts (Noto Sans)

### Technologies
- Vue.js team
- Vercel platform
- SVG.js community

---

**Last Updated**: 2026-01-08
**Version**: 2.0.0 (World Edition)
**Status**: Ready for deployment 🚀
