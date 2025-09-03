#!/bin/bash

# Script to remove sensitive files from Git history
# Run this script if you've already committed sensitive files

echo "Removing sensitive files from Git history..."

# Remove .env files from Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch frontend/.env backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Remove firebase-config.js from Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch frontend/public/firebase-config.js' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to update remote repository
echo "Force pushing to update remote repository..."
git push origin --force --all

echo "Sensitive files removed from Git history!"
echo "Make sure to:"
echo "1. Create .env files from the example files"
echo "2. Add your actual configuration values"
echo "3. Never commit .env files again"
