# R4B App - Cloudflare Tunnel Deployment

## Quick Start

### 1. Push to GitHub
```bash
git add .
git commit -m "Migration complete - ready for deployment"
git push origin main
```

### 2. Server Setup (Ubuntu 22.04)
Follow complete guide: [deployment-guide.md](file:///C:/Users/Adonis/.gemini/antigravity/brain/c2b9c44f-0ef8-4f34-8e01-8a73a9dca7ca/deployment-guide.md)

### 3. Configuration Files
- **PM2**: `server/ecosystem.config.js`
- **Nginx**: `nginx.conf`
- **Frontend Env**: `.env.production`

### 4. Key Commands
```bash
# Backend
pm2 start server/ecosystem.config.js
pm2 save
pm2 startup

# Frontend
npm run build

# Cloudflare Tunnel
sudo cloudflared service install
sudo systemctl start cloudflared
```

## Architecture
```
Internet → Cloudflare Tunnel → Ubuntu (PM2 + nginx)
                                 ├── Frontend (:80)
                                 └── Backend (:5000)
```

## No Docker Required ✅
- PM2 manages backend process
- nginx serves frontend static files
- Cloudflare Tunnel handles HTTPS + DDoS protection
