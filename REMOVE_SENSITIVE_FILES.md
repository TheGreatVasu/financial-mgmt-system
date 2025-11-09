# 🔒 Remove Sensitive Files from Git - Step-by-Step Guide

## ⚠️ **IMPORTANT: Read This First**

This guide will help you:
1. ✅ Remove sensitive files (`.env`, database files) from Git tracking
2. ✅ Update `.gitignore` to prevent future commits
3. ✅ Safely push your code without exposing secrets

**Note:** This will NOT delete files from your local computer, only from Git tracking.

---

## 📋 **Step 1: Check What's Currently Tracked**

First, let's see what sensitive files might already be in Git:

```bash
cd /Users/somilshivhare/financial-mgmt-system

# Check if .env files are tracked
git ls-files | grep -E "\.env$|\.env\."

# Check if database files are tracked
git ls-files | grep -E "\.db$|\.sqlite$|\.sqlite3$"

# Check if node_modules are tracked (shouldn't be)
git ls-files | grep node_modules

# Check all tracked files (to review)
git ls-files
```

---

## 🔧 **Step 2: Remove Sensitive Files from Git Tracking**

### **2.1 Remove .env Files from Tracking**

```bash
# Remove backend/.env from Git (keeps local file)
git rm --cached backend/.env

# Remove frontend/.env if it exists
git rm --cached frontend/.env 2>/dev/null || true

# Remove root .env if it exists
git rm --cached .env 2>/dev/null || true

# Remove any other .env variants
git rm --cached .env.local 2>/dev/null || true
git rm --cached .env.development 2>/dev/null || true
git rm --cached .env.production 2>/dev/null || true
git rm --cached backend/.env.local 2>/dev/null || true
git rm --cached frontend/.env.local 2>/dev/null || true
```

### **2.2 Remove Database Files from Tracking**

```bash
# Remove any database files (if tracked)
git rm --cached *.db 2>/dev/null || true
git rm --cached *.sqlite 2>/dev/null || true
git rm --cached *.sqlite3 2>/dev/null || true
git rm --cached backend/*.db 2>/dev/null || true
git rm --cached frontend/*.db 2>/dev/null || true
```

### **2.3 Remove Log Files from Tracking**

```bash
# Remove log files
git rm --cached backend/logs/*.log 2>/dev/null || true
git rm --cached *.log 2>/dev/null || true
```

### **2.4 Remove node_modules (if accidentally tracked)**

```bash
# Remove node_modules from tracking (if any)
git rm -r --cached backend/node_modules 2>/dev/null || true
git rm -r --cached frontend/node_modules 2>/dev/null || true
git rm -r --cached node_modules 2>/dev/null || true
```

### **2.5 Remove Build/Dist Files**

```bash
# Remove build files
git rm -r --cached frontend/dist 2>/dev/null || true
git rm -r --cached frontend/build 2>/dev/null || true
git rm -r --cached backend/build 2>/dev/null || true
```

---

## ✅ **Step 3: Verify .gitignore is Updated**

The `.gitignore` file has been updated. Verify it includes all necessary exclusions:

```bash
# Check .gitignore content
cat .gitignore | grep -E "\.env|\.db|node_modules|logs"
```

---

## 📝 **Step 4: Stage Changes and Commit**

```bash
# Stage the updated .gitignore
git add .gitignore

# Stage the removal of sensitive files
git add -A

# Check what will be committed (review carefully!)
git status

# Commit the changes
git commit -m "chore: remove sensitive files from tracking and update .gitignore

- Remove .env files from Git tracking
- Remove database files from tracking
- Update .gitignore with comprehensive exclusions
- Keep local files intact"
```

---

## 🚀 **Step 5: Push to GitHub**

```bash
# Push to GitHub
git push origin main

# Or if your branch is named differently:
# git push origin master
# git push origin develop
```

---

## 🔍 **Step 6: Verify Everything is Correct**

After pushing, verify that sensitive files are NOT on GitHub:

1. **Go to your GitHub repository**
2. **Check that `.env` files are NOT visible**
3. **Check that database files are NOT visible**
4. **Verify `.gitignore` is present and correct**

---

## 🛡️ **Step 7: Future Pushes (Safe Workflow)**

From now on, use this safe workflow:

```bash
# 1. Check what will be committed (always review!)
git status

# 2. Add files (Git will automatically respect .gitignore)
git add .

# 3. Review what's staged (double-check!)
git status

# 4. Commit
git commit -m "your commit message"

# 5. Push
git push origin main
```

**✅ Git will automatically ignore:**
- `.env` files
- Database files (`.db`, `.sqlite`)
- `node_modules/`
- Log files
- Build files

---

## 🔄 **If You Already Pushed Sensitive Files**

If sensitive files were already pushed to GitHub, you need to remove them from Git history:

### **Option A: Remove from Recent Commits (Recommended)**

```bash
# Remove .env from last commit (if it was just added)
git rm --cached backend/.env
git commit --amend -m "Updated commit message"
git push --force-with-lease origin main
```

### **Option B: Remove from Git History (Advanced - Use with Caution)**

⚠️ **WARNING:** This rewrites Git history. Only use if absolutely necessary and coordinate with your team.

```bash
# Install git-filter-repo (if not installed)
# Mac: brew install git-filter-repo
# Linux: pip install git-filter-repo

# Remove .env files from entire Git history
git filter-repo --path backend/.env --invert-paths
git filter-repo --path frontend/.env --invert-paths

# Force push (coordinate with team first!)
git push --force origin main
```

**Alternative using BFG Repo-Cleaner:**
```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
# Remove .env files
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force origin main
```

---

## 📋 **Quick Reference: Safe Commands**

### **Check Before Committing**
```bash
# See what will be committed
git status

# See detailed changes
git diff --cached

# Check if .env is being tracked
git ls-files | grep .env
```

### **Safe Add Command**
```bash
# This respects .gitignore automatically
git add .

# Or be explicit
git add src/
git add frontend/src/
git add backend/src/
```

### **Verify .gitignore is Working**
```bash
# Test if a file would be ignored
git check-ignore -v backend/.env
# Should show: backend/.env matches .gitignore pattern

# List all ignored files
git status --ignored
```

---

## 🎯 **Complete One-Time Setup Script**

Copy and paste this entire block to do everything at once:

```bash
#!/bin/bash

cd /Users/somilshivhare/financial-mgmt-system

echo "🔍 Checking for sensitive files in Git..."

# Check what's tracked
echo "Tracked .env files:"
git ls-files | grep -E "\.env$|\.env\." || echo "None found ✅"

echo ""
echo "Removing sensitive files from tracking..."

# Remove .env files
git rm --cached backend/.env 2>/dev/null && echo "✅ Removed backend/.env" || echo "ℹ️  backend/.env not tracked"
git rm --cached frontend/.env 2>/dev/null && echo "✅ Removed frontend/.env" || echo "ℹ️  frontend/.env not tracked"
git rm --cached .env 2>/dev/null && echo "✅ Removed .env" || echo "ℹ️  .env not tracked"

# Remove database files
git rm --cached *.db 2>/dev/null && echo "✅ Removed .db files" || echo "ℹ️  No .db files tracked"
git rm --cached *.sqlite 2>/dev/null && echo "✅ Removed .sqlite files" || echo "ℹ️  No .sqlite files tracked"

# Remove node_modules if tracked
git rm -r --cached backend/node_modules 2>/dev/null && echo "✅ Removed backend/node_modules" || echo "ℹ️  backend/node_modules not tracked"
git rm -r --cached frontend/node_modules 2>/dev/null && echo "✅ Removed frontend/node_modules" || echo "ℹ️  frontend/node_modules not tracked"

echo ""
echo "📝 Staging .gitignore..."
git add .gitignore

echo ""
echo "📋 Review what will be committed:"
git status

echo ""
echo "✅ Ready to commit! Run:"
echo "   git commit -m 'chore: remove sensitive files from tracking'"
echo "   git push origin main"
```

Save as `remove-sensitive.sh`, make executable, and run:
```bash
chmod +x remove-sensitive.sh
./remove-sensitive.sh
```

---

## ✅ **Verification Checklist**

After completing the steps, verify:

- [ ] `.gitignore` is updated with comprehensive exclusions
- [ ] `.env` files are NOT in `git ls-files` output
- [ ] Database files are NOT tracked
- [ ] `node_modules/` is NOT tracked
- [ ] `git status` shows only code files
- [ ] Files are removed from Git but still exist locally
- [ ] After push, GitHub doesn't show sensitive files

---

## 🆘 **Troubleshooting**

### **"fatal: pathspec '.env' did not match any files"**
✅ **This is GOOD!** It means the file wasn't tracked. You can skip that command.

### **"error: the following file has changes staged in the index"**
```bash
# Force remove
git rm --cached -f backend/.env
```

### **"Updates were rejected because the remote contains work"**
```bash
# Pull first, then push
git pull origin main
git push origin main
```

### **Want to see what's currently ignored?**
```bash
git status --ignored
```

---

## 🎉 **You're Done!**

Your repository is now secure. Future pushes will automatically exclude:
- ✅ `.env` files (with passwords)
- ✅ Database files
- ✅ `node_modules/`
- ✅ Log files
- ✅ Build artifacts

Only your code will be pushed to GitHub! 🚀

