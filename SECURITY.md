# 🔐 Security Notice

## Critical: Environment Variables

**BEFORE deploying to production:**

1. **Supabase Credentials:**
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Service role key (for backend)
   - `SUPABASE_ANON_KEY`: Anon key (for frontend OAuth)

2. **Update Email Credentials (Optional):**
   - Use Gmail App Password (không dùng password thật)
   - Guide: https://support.google.com/accounts/answer/185833

3. **Set Correct CLIENT_URL:**
   - Production: Your actual domain (e.g., `https://yourdomain.com`)
   - Local dev: `http://localhost:5173`

4. **API URL Configuration:**
   - Production: Set `VITE_API_URL` to your backend URL
   - Local dev: Defaults to `http://localhost:5000`

## Setup Steps

1. **Copy example files:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials** in `.env` file

3. **Never commit .env files** (already in .gitignore)

## Environment Variables Reference

| Variable               | Required   | Default | Description                           |
| ---------------------- | ---------- | ------- | ------------------------------------- |
| `SUPABASE_URL`         | ✅ Yes      | -       | Supabase project URL                  |
| `SUPABASE_SERVICE_KEY` | ✅ Yes      | -       | Supabase service role key             |
| `SUPABASE_ANON_KEY`    | ✅ Yes      | -       | Supabase anon key                     |
| `EMAIL_USER`           | ⚠️ Optional | -       | Gmail for sending verification emails |
| `EMAIL_PASS`           | ⚠️ Optional | -       | Gmail App Password                    |
| `CLIENT_URL`           | ✅ Yes      | -       | Frontend URL for email links          |
| `VITE_API_URL`         | ✅ Yes      | -       | Backend API URL                       |

## Security Checklist

- [ ] Supabase keys are properly configured
- [ ] EMAIL_PASS is Gmail App Password, not real password
- [ ] `.env` files are in `.gitignore`
- [ ] Production `.env` different from development
- [ ] No hardcoded secrets in codebase
