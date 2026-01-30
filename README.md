# R4B Application

Full-stack application với React frontend và Express backend, sử dụng Supabase Postgres database.

## Tech Stack

**Frontend**:
- React 18 + Vite
- React Router
- Tailwind CSS

**Backend**:
- Node.js + Express
- Supabase (Postgres)
- JWT Authentication

**External Services**:
- Supabase Database
- TPBank API
- Binance API

## Project Structure

```
App/
├── src/                 # Frontend source
├── server/             # Backend API
│   ├── routes/         # API endpoints
│   ├── workers/        # Background workers
│   ├── utils/          # Utilities
│   └── config/         # Configuration
├── nginx.conf          # Nginx config for deployment
└── DEPLOYMENT.md       # Deployment guide
```

## Setup

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Install dependencies
npm install
cd server && npm install

# Configure environment
cp .env.example .env
cp server/.env.example server/.env
# Edit .env files with your credentials
```

### Development

```bash
# Frontend dev server
npm run dev

# Backend dev server
cd server
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Start backend with PM2
cd server
pm2 start ecosystem.config.js
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide using Cloudflare Tunnel.

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (server/.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

## License

Private - All Rights Reserved
