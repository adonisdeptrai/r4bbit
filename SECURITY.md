# 🔐 Security Notice

## Critical: Environment Variables

**BEFORE deploying to production:**

1. **Generate Strong JWT Secret:**
   ```bash
   openssl rand -hex 32
   ```
   Copy output và replace `JWT_SECRET` trong `.env`

2. **Update Email Credentials:**
   - Use Gmail App Password (không dùng password thật)
   - Guide: https://support.google.com/accounts/answer/185833

3. **Verify MongoDB URI:**
   - Docker: `mongodb://mongo:27017/r4b_db`
   - Local: `mongodb://localhost:27017/r4b_db`

4. **Set Correct CLIENT_URL:**
   - Production: Your actual domain (e.g., `https://yourdomain.com`)
   - Docker: `http://localhost:8080`
   - Local dev: `http://localhost:5173`

## Setup Steps

1. **Copy example files:**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

2. **Fill in your credentials** in both `.env` files

3. **Never commit .env files** (already in .gitignore)

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ Yes | - | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT signing |
| `EMAIL_USER` | ⚠️ Optional | - | Gmail for sending verification emails |
| `EMAIL_PASS` | ⚠️ Optional | - | Gmail App Password |
| `CLIENT_URL` | ✅ Yes | - | Frontend URL for email links |

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters (use openssl)
- [ ] EMAIL_PASS is Gmail App Password, not real password
- [ ] `.env` files are in `.gitignore`
- [ ] Production `.env` different from development
- [ ] No hardcoded secrets in codebase
