# Git Push Script for R4B App
# Run this script to push code to GitHub

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
Set-Location "C:\Users\Adonis\Downloads\App"

# Initialize git if needed
if (!(Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
}

# Check if remote exists
$remote = git remote -v 2>$null | Select-String "origin"
if (!$remote) {
    Write-Host "Adding remote repository..." -ForegroundColor Cyan
    git remote add origin https://github.com/adonisdeptrai/r4bbit.git
} else {
    Write-Host "Remote already exists, updating URL..." -ForegroundColor Cyan
    git remote set-url origin https://github.com/adonisdeptrai/r4bbit.git
}

# Stage all files
Write-Host "Staging files..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "Creating commit..." -ForegroundColor Cyan
git commit -m "Migration MongoDB to Supabase complete - Production ready"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host ""
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "Repository: https://github.com/adonisdeptrai/r4bbit" -ForegroundColor Yellow
