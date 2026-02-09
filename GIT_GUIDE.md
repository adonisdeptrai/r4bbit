# Quick Git Commands

## First Time Setup (if git not installed)
1. Download & install Git: https://git-scm.com/download/win
2. Restart PowerShell after installation

## Push to GitHub

### Option A: Use Script (Easiest)
```powershell
cd C:\Users\Adonis\Downloads\App
.\git-push.ps1
```

### Option B: Manual Commands
```bash
# Initialize (first time only)
git init
git branch -M main

# Add remote
git remote add origin https://github.com/adonisdeptrai/r4bbit.git

# Commit and push
git add .
git commit -m "Migration MongoDB to Supabase complete"
git push -u origin main --force
```

## Update Code (after changes)
```bash
git add .
git commit -m "Your commit message"
git push
```

## Repository URL
https://github.com/adonisdeptrai/r4bbit
