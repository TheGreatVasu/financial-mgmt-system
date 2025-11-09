# Git Cleanup Commands - Remove Sensitive Files from Tracking

## ⚠️ IMPORTANT: Read Before Running

These commands will:
- ✅ Remove sensitive files from Git tracking (but keep them on your local machine)
- ✅ Update .gitignore to prevent future commits of sensitive files
- ✅ Keep your local files intact (they won't be deleted)

---

## Step 1: Update .gitignore (Already Done)

The `.gitignore` file has been updated with comprehensive rules.

---

## Step 2: Remove Tracked Sensitive Files from Git

Run these commands **one by one** in your terminal:

### 2.1 Remove .env files from tracking (if tracked)
```powershell
git rm --cached backend/.env
git rm --cached frontend/.env 2>$null
git rm --cached .env 2>$null
```

### 2.2 Remove log files from tracking
```powershell
git rm --cached backend/logs/*.log 2>$null
git rm --cached backend/*.log 2>$null
git rm --cached frontend/*.log 2>$null
```

### 2.3 Remove uploaded avatar files from tracking
```powershell
git rm --cached backend/uploads/avatars/*.jpg
git rm --cached backend/uploads/avatars/*.jpeg
git rm --cached backend/uploads/avatars/*.png
```

### 2.4 Remove any database files (if tracked)
```powershell
git rm --cached *.db 2>$null
git rm --cached *.sqlite 2>$null
git rm --cached *.sqlite3 2>$null
```

### 2.5 Remove any temporary setup scripts (if tracked)
```powershell
git rm --cached backend/setup-*.js 2>$null
git rm --cached backend/run-*.js 2>$null
git rm --cached backend/verify-*.js 2>$null
git rm --cached backend/check-*.js 2>$null
git rm --cached backend/add-*.js 2>$null
```

---

## Step 3: Stage the Updated .gitignore

```powershell
git add .gitignore
```

---

## Step 4: Commit the Changes

```powershell
git commit -m "chore: remove sensitive files from tracking and update .gitignore"
```

---

## Step 5: Verify What Will Be Pushed

Before pushing, check what will be sent to GitHub:

```powershell
git status
```

You should see:
- ✅ `.gitignore` staged for commit
- ✅ Sensitive files removed from tracking
- ❌ No `.env` files
- ❌ No log files
- ❌ No uploaded files

---

## Step 6: Push to GitHub

```powershell
git push origin main
```

(Replace `main` with your branch name if different: `master`, `develop`, etc.)

---

## ✅ Verification After Push

After pushing, verify on GitHub that:
- ✅ `.env` files are NOT visible
- ✅ Log files are NOT visible
- ✅ Uploaded files are NOT visible
- ✅ Only code files are present

---

## 🔒 Future Protection

From now on, when you run:
```powershell
git add .
git commit -m "your message"
git push
```

Git will automatically ignore:
- ✅ All `.env` files
- ✅ All log files
- ✅ All uploaded files
- ✅ All database files
- ✅ All node_modules
- ✅ All build/dist folders

---

## 🚨 If You Accidentally Pushed Sensitive Data

If you already pushed sensitive files to GitHub:

1. **Change your passwords immediately** (MySQL, JWT_SECRET, etc.)
2. **Remove sensitive files from Git history** (requires force push):
   ```powershell
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
   ⚠️ **Warning**: Force push rewrites history. Only do this if you're the only one using the repo.

3. **Or create a new repository** and start fresh (safer option)

---

## 📋 Quick Reference - All Commands in One Block

Copy and paste this entire block:

```powershell
# Remove sensitive files from tracking
git rm --cached backend/.env 2>$null
git rm --cached frontend/.env 2>$null
git rm --cached .env 2>$null
git rm --cached backend/logs/*.log 2>$null
git rm --cached backend/*.log 2>$null
git rm --cached backend/uploads/avatars/*.jpg 2>$null
git rm --cached backend/uploads/avatars/*.jpeg 2>$null
git rm --cached backend/uploads/avatars/*.png 2>$null
git rm --cached *.db 2>$null
git rm --cached *.sqlite 2>$null

# Stage .gitignore
git add .gitignore

# Commit
git commit -m "chore: remove sensitive files from tracking and update .gitignore"

# Verify
git status

# Push (replace 'main' with your branch name)
git push origin main
```

---

## ✅ Done!

After running these commands, your repository is clean and safe to push.

