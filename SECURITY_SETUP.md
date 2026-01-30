# 🔐 Security Setup Guide

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. Remove Exposed Credentials from Git History

```bash
# CRITICAL: Đã commit .env.production lên git!
# Các credentials này đã bị expose và cần thay đổi NGAY:

# ❌ JWT_SECRET: f4eb5d06d86016a2977f883da4c8614486588a4422fc90623d24e526a7e0d37e
# ❌ EMAIL_PASS: bfdnqgfvkrbjhbqc
```

**Action Steps:**

1. **Revoke Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Revoke password: `bfdnqgfvkrbjhbqc`
   - Generate new App Password

2. **Generate New JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Clean Git History (Optional but recommended):**
   ```bash
   # WARNING: This rewrites history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.production .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (if safe to do so)
   git push origin --force --all
   ```

---

## 🔑 Environment Variables Setup

### Server (.env)
Create `server/.env` (NOT committed):

```bash
# MongoDB
MONGO_URI=mongodb://mongo:27017/r4b_db

# JWT Secret - MUST be unique per environment!
JWT_SECRET=<GENERATE_NEW_32_BYTE_HEX>

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=<NEW_GMAIL_APP_PASSWORD>
ADMIN_EMAIL=admin@yourdomain.com

# Client URL
CLIENT_URL=http://localhost:8080

# Encryption Key (NEW - for database encryption)
ENCRYPTION_KEY=<GENERATE_NEW_32_BYTE_HEX>
```

**Generate secrets:**
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (.env)
Create `/.env` (NOT committed):

```bash
VITE_API_URL=http://localhost:5000
```

### Production Environment

**Server:**
```bash
JWT_SECRET=<PRODUCTION_SECRET>
MONGO_URI=mongodb://mongo:27017/r4b_db
EMAIL_USER=<PRODUCTION_EMAIL>
EMAIL_PASS=<PRODUCTION_APP_PASSWORD>
CLIENT_URL=https://mmopro.click
ENCRYPTION_KEY=<PRODUCTION_ENCRYPTION_KEY>
NODE_ENV=production
```

**Frontend:**
```bash
VITE_API_URL=https://api.mmopro.click
```

---

## 🔐 Database Encryption Setup

The following sensitive fields are NOW encrypted in database:
- `settings.bank.password` (TPBank password)
- `settings.binance.secretKey` (Binance Secret Key)

**Validation:**
```javascript
// These are automatically encrypted/decrypted
const settings = await Settings.findOne();
console.log(settings.bank.password); // Automatically decrypted when accessed
```

---

## ✅ Security Checklist

- [ ] Remove `.env.production` from repository
- [ ] Revoke exposed Gmail App Password
- [ ] Generate new JWT_SECRET
- [ ] Generate ENCRYPTION_KEY
- [ ] Update production environment variables
- [ ] Verify encryption is working
- [ ] Test login flow với new JWT secret (users will be logged out)
- [ ] Verify Settings encryption/decryption

---

## 🚨 In Case of Breach

If you suspect credentials have been compromised:

1. **Immediately:**
   - Change all passwords
   - Rotate JWT_SECRET (logs out all users)
   - Check bank transaction history
   - Monitor Binance account activity

2. **Investigate:**
   - Check server logs for unauthorized access
   - Review recent orders/transactions
   - Audit user accounts for suspicious activity

3. **Notify:**
   - Users (if personal data affected)
   - Authorities (if financial damage)

---

**Created:** 2026-01-25  
**Last Updated:** 2026-01-25
