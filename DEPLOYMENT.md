# Deployment Guide - World Map Levels on Vercel

This guide will help you deploy the World Map Levels application to Vercel with full high-scores functionality.

## Prerequisites

- Node.js 18+ installed
- Git repository
- Vercel account (free tier works)
- GitHub account (for automatic deployments)

## Quick Start (5 minutes)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `world-map-levels` (or your choice)
   - In which directory is your code located? `./`
   - Override settings? **N**

5. **Done!** Your deployment URL will be displayed.

## Environment Variables (Optional)

For production high-scores with database storage:

### 1. Add Database (Vercel Postgres)

```bash
# Via CLI
vercel env add DATABASE_URL

# Or via Dashboard:
# Project Settings → Environment Variables → Add New
```

### 2. Add Verification Secret

```bash
# Generate a random secret
openssl rand -hex 32

# Add to Vercel
vercel env add VERIFICATION_SECRET
```

### 3. Redeploy

```bash
vercel --prod
```

## Project Structure for Deployment

```
/home/user/World/
├── html/                  # Static files (auto-deployed)
│   ├── index.html        # Entry point
│   ├── us.html           # US version (legacy)
│   ├── eu.html           # Europe version (legacy)
│   └── *.js, *.css       # Assets
├── api/                   # Serverless functions
│   ├── scores.js         # High-scores API
│   └── lib/
│       └── validation.js # Score validation
├── vercel.json           # Deployment config
└── package.json          # Dependencies
```

## Vercel Configuration Explained

### `vercel.json` Settings

```json
{
  "version": 2,
  "builds": [
    {
      "src": "html/**",
      "use": "@vercel/static"     // Serve HTML/CSS/JS as static files
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"       // Run API as serverless functions
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },        // API routes
    { "src": "/(.*)", "dest": "/html/$1" },           // Static files
    { "src": "/", "dest": "/html/index.html" }        // Homepage
  ]
}
```

### Key Features:
- **Automatic HTTPS**: Free SSL certificates
- **Global CDN**: Fast loading worldwide
- **Serverless Functions**: High-scores API scales automatically
- **Automatic Deployments**: Push to GitHub → auto-deploy

## Custom Domain (Optional)

### 1. Add Domain in Vercel Dashboard

- Go to Project Settings → Domains
- Add your domain: `maplevels.com`
- Follow DNS configuration instructions

### 2. Update DNS Records

Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Wait for Propagation

DNS changes can take up to 48 hours (usually much faster).

## Deployment Workflows

### Automatic Deployments (Recommended)

Every `git push` triggers a deployment:

- **main branch** → Production (`your-project.vercel.app`)
- **Pull Requests** → Preview URLs (`your-pr-abc123.vercel.app`)
- **Other branches** → Branch previews

### Manual Deployments

```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy
```

## Testing Locally

Run the development server locally before deploying:

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit: `http://localhost:3000`

Test API endpoints:
- `http://localhost:3000/api/scores` (GET)
- `http://localhost:3000/api/scores` (POST)

## Monitoring & Analytics

### Vercel Dashboard

- **Deployments**: View all deployment history
- **Analytics**: Page views, performance metrics (requires Pro plan)
- **Logs**: Function execution logs (under Functions tab)

### Check API Logs

```bash
vercel logs [deployment-url]
```

## Troubleshooting

### Common Issues

#### 1. **404 on Static Files**

**Problem**: Files not found after deployment

**Solution**: Check `vercel.json` routes configuration:
```json
{ "src": "/(.*)", "dest": "/html/$1" }
```

#### 2. **API Returns 500 Error**

**Problem**: Serverless function crashes

**Solution**: Check logs:
```bash
vercel logs --follow
```

Common causes:
- Missing environment variables
- Syntax errors in API code
- Missing dependencies

#### 3. **Deployment Fails**

**Problem**: Build or deployment error

**Solution**:
- Check Node.js version: `package.json` requires Node 18+
- Review build logs in Vercel dashboard
- Ensure all files are committed to Git

#### 4. **High-Scores Not Saving**

**Problem**: Scores submit but don't persist

**Solution**:
- Current implementation uses in-memory storage
- For persistence, add Vercel Postgres database
- Update `api/scores.js` to use database connection

### Get Help

- **Vercel Support**: https://vercel.com/support
- **Project Issues**: https://github.com/[your-repo]/issues
- **Vercel Docs**: https://vercel.com/docs

## Performance Optimization

### Enable Compression

Already configured in `vercel.json`:
- Brotli compression for all static files
- Gzip fallback for older browsers

### Cache Settings

```json
"headers": [
  {
    "source": "/html/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

### Image Optimization

Use Vercel Image Optimization for map exports:
```javascript
// In your code
<img src="/_next/image?url=/maps/world.svg&w=1920&q=75" />
```

## Database Setup (Advanced)

### Using Vercel Postgres

1. **Create Database**:
   ```bash
   vercel postgres create
   ```

2. **Link to Project**:
   ```bash
   vercel link
   vercel postgres connect
   ```

3. **Create Schema**:
   ```sql
   CREATE TABLE scores (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     nickname VARCHAR(50) NOT NULL,
     total_score INTEGER NOT NULL,
     countries_visited INTEGER NOT NULL,
     continents_completed TEXT[],
     map_data JSONB NOT NULL,
     timestamp TIMESTAMP DEFAULT NOW(),
     verification_hash VARCHAR(64) NOT NULL,
     is_verified BOOLEAN DEFAULT true
   );

   CREATE INDEX idx_scores_total ON scores(total_score DESC);
   CREATE INDEX idx_scores_timestamp ON scores(timestamp DESC);
   ```

4. **Update API Code**:
   Replace in-memory array with database queries in `api/scores.js`.

## Cost Estimation

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Serverless functions (100GB-hours)
- ✅ Analytics (basic)

### When to Upgrade:
- **Pro ($20/month)**: Advanced analytics, better DDoS protection
- **Enterprise**: Custom pricing for high-traffic applications

### Expected Costs (Free Tier):
- **<10K users/month**: FREE
- **10K-100K users**: FREE (within bandwidth limits)
- **>100K users**: Consider Pro plan

## Security Checklist

- [x] HTTPS enabled (automatic)
- [x] CORS headers configured
- [x] Score validation implemented
- [x] Rate limiting needed (add middleware)
- [x] Environment variables for secrets
- [ ] Add authentication (optional)
- [ ] Add CAPTCHA for score submission (optional)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test high-scores functionality
3. ⬜ Add database for persistence
4. ⬜ Implement rate limiting
5. ⬜ Add social sharing features
6. ⬜ Set up custom domain
7. ⬜ Enable analytics

## Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Serverless Functions Guide**: https://vercel.com/docs/functions/serverless-functions
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Custom Domains**: https://vercel.com/docs/custom-domains

---

**Questions?** Open an issue on GitHub or check the [Claude.md](./Claude.md) file for more details.

**Ready to deploy?** Run `npm run deploy` and share your world map! 🌍
