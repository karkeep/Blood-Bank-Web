# Firebase Google Auth Setup Guide

## Common Issues and Solutions for Google Sign-In

### 1. **Enable Google Sign-In in Firebase Console**

The most common issue is that Google Sign-In is not enabled in your Firebase project.

**Steps to enable:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `blood-bank-f759d`
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Google** in the providers list
5. Click on it and toggle **Enable**
6. Add your project support email
7. Click **Save**

### 2. **Whitelist Your Domain**

For localhost development:
- `localhost` is automatically whitelisted
- `127.0.0.1` is automatically whitelisted

For production:
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain

### 3. **Check Browser Console**

Common error codes and their meanings:

- **`auth/popup-blocked`**: Browser is blocking popups. Allow popups for localhost
- **`auth/unauthorized-domain`**: Domain not authorized in Firebase
- **`auth/operation-not-allowed`**: Google sign-in not enabled
- **`auth/invalid-api-key`**: Firebase configuration issue

### 4. **Browser-Specific Issues**

**Chrome:**
- Check if popups are blocked (icon in address bar)
- Clear cookies and cache for localhost

**Firefox:**
- Check popup blocker settings
- Try private/incognito mode

**Safari:**
- Disable "Prevent cross-site tracking" in Settings
- Allow popups

### 5. **Quick Fixes to Try**

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart the dev server
npm run dev
```

### 6. **Test Different Auth Methods**

The diagnostics component provides two methods:
1. **Popup** (default) - Opens a popup window
2. **Redirect** - Redirects to Google and back

If popup is blocked, the redirect method will automatically be suggested.

### 7. **Verify Firebase Configuration**

Check that your Firebase config in `/client/src/lib/firebase-config.ts` matches your Firebase project:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8",
  authDomain: "blood-bank-f759d.firebaseapp.com",
  projectId: "blood-bank-f759d",
  // ... rest of config
};
```

### 8. **Enable Third-Party Cookies** (if needed)

Some browsers block third-party cookies which can affect Google Sign-In:
- Chrome: Settings → Privacy → Cookies → Allow all cookies (for testing)
- Firefox: Settings → Privacy → Custom → Accept third-party cookies

## Next Steps

1. Run the app and go to `/auth`
2. Check the Google Auth Diagnostics component
3. It will show you:
   - ✅ What's working
   - ❌ What's not working
   - Error messages with explanations
4. Try the "Test Google Sign-In" button
5. If popup fails, try the redirect method

## Still Not Working?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify Google Sign-In is enabled in Firebase Console
3. Try a different browser or incognito mode
4. Check if any browser extensions are blocking the auth
