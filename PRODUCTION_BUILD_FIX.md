# Production Build Fix

## Problem
When running `npm run build`, the production build doesn't work because:
1. `.env` file has `localhost` URL instead of production URL
2. In dev mode, Vite proxy handles `/api` automatically, masking the issue
3. Production builds bake environment variables at build time

## Solution

### Option 1: Use .env.production.local (Recommended)

1. **Create production environment file:**
   ```bash
   cd frontend
   cp .env.production.example .env.production.local
   ```

2. **Edit `.env.production.local` and set:**
   ```bash
   VITE_API_BASE_URL=https://nbaurum.com/api
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

**Note:** `.env.production.local` is gitignored and used automatically during production builds.

### Option 2: Set Environment Variable Before Build

**Windows (PowerShell):**
```powershell
$env:VITE_API_BASE_URL="https://nbaurum.com/api"
npm run build
```

**Windows (CMD):**
```cmd
set VITE_API_BASE_URL=https://nbaurum.com/api
npm run build
```

**Linux/Mac:**
```bash
VITE_API_BASE_URL=https://nbaurum.com/api npm run build
```

### Option 3: Temporarily Edit .env

1. Edit `frontend/.env`:
   ```bash
   # Comment out development URL
   # VITE_API_BASE_URL=/api
   
   # Uncomment production URL
   VITE_API_BASE_URL=https://nbaurum.com/api
   ```

2. Build:
   ```bash
   npm run build
   ```

3. **Revert after building** (for local dev to work)

## Environment File Priority

Vite loads environment files in this order (higher priority overrides lower):
1. `.env.production.local` (production builds, gitignored)
2. `.env.local` (all environments, gitignored)
3. `.env.production` (production builds)
4. `.env` (all environments)

## Validation

The build will now:
- ✅ Validate that `VITE_API_BASE_URL` is set in production
- ✅ Validate that production URL uses HTTPS
- ✅ Show clear error messages if misconfigured
- ✅ Allow `/api` or localhost in development

## Current Configuration

- **Development:** Uses `/api` (Vite proxy handles it)
- **Production:** Must use `https://nbaurum.com/api`

## Build Scripts

- `npm run dev` - Development server (uses `.env`)
- `npm run build` - Production build (uses `.env.production.local` if exists)
- `npm run build:prod` - Explicit production build

