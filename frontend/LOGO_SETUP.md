# 🎨 Logo Setup Guide - Add Your Logo from Google

## 📋 Quick Steps to Add Logo from Google

### Step 1: Get Image URL from Google Images

1. **Open Google Images**: Go to https://images.google.com
2. **Search for your logo**: Type your search (e.g., "startup logo", "company logo icon")
3. **Select an image**: Click on the image you like
4. **Get the image URL**:
   - **Method 1**: Right-click on the image → Select **"Copy image address"** or **"Copy image link"**
   - **Method 2**: Click "View image" → Copy the URL from the address bar
5. **You'll get a URL** like: `https://example.com/path/to/logo.png` or `https://i.imgur.com/xxxxx.png`

### Step 2: Update the Logo in Code

**File to edit**: `frontend/src/components/layout/DashboardLayout.jsx`

**Find this line** (around line 101):
```jsx
src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop"
```

**Replace with your Google image URL**:
```jsx
src="YOUR_COPIED_GOOGLE_IMAGE_URL_HERE"
```

**Example**:
```jsx
src="https://i.imgur.com/abc123.png"
// or
src="https://example.com/logo.png"
```

### Step 3: Save and Test

1. Save the file (`Ctrl+S` or `Cmd+S`)
2. Refresh your browser
3. The logo should appear in place of the square box!

---

## ✅ What's Currently Set Up

- ✅ Logo image element is ready
- ✅ Fallback to "SP" initials if image fails to load
- ✅ Proper sizing (32x32 pixels)
- ✅ Rounded corners and shadow
- ✅ Clickable and redirects to dashboard

---

## 🔄 Alternative: Use Local Logo File

If you prefer to download and use a local file:

1. **Download the logo** from Google Images
2. **Save it** as `logo.png` in: `frontend/public/`
3. **Update the code** to:
```jsx
src="/logo.png"
```

---

## 💡 Tips

- **Best image size**: 64x64 pixels or larger (will be scaled down)
- **Supported formats**: PNG, JPG, SVG, WebP
- **For best results**: Use PNG with transparent background
- **If logo doesn't show**: Check browser console for errors, verify the URL is accessible

---

## 🎯 Current Status

The logo is set up and ready. Just replace the placeholder URL with your Google image URL!

**Location in code**: Line ~101 in `frontend/src/components/layout/DashboardLayout.jsx`

