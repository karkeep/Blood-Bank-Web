# Fix Google Login Issue - Blood Bank Project

## Quick Diagnostic Steps

### 1. Test Basic HTML Page First
I've created a simple test page to verify Firebase and Google Auth are configured correctly:

```bash
# Open the simple test page in your browser
open /Users/prabeshkarkee/Desktop/blood-bank/client/simple-google-test.html
```

If this works, the issue is in the React app. If it doesn't work, it's a Firebase configuration issue.

### 2. Most Common Issue: Google Sign-In Not Enabled

**Go to Firebase Console:**
1. Visit: https://console.firebase.google.com/project/blood-bank-f759d/authentication/providers
2. Click on **Google** provider
3. Toggle **Enable** to ON
4. Add a support email (your email)
5. Click **Save**

### 3. Run the Diagnostics

1. Start your development server:
   ```bash
   cd /Users/prabeshkarkee/Desktop/blood-bank
   npm run dev
   ```

2. Visit: http://localhost:5173/auth

3. Look at the **Google Auth Diagnostics** component which will show:
   - ✅ Firebase Initialized
   - ✅ Auth Service Ready  
   - ✅ Google Provider Configured

4. Click "Test Google Sign-In (Popup)"

### 4. Common Error Messages and Fixes

**Error: `auth/operation-not-allowed`**
- **Cause**: Google sign-in is disabled in Firebase
- **Fix**: Enable it in Firebase Console (see step 2)

**Error: `auth/popup-blocked`**
- **Cause**: Browser is blocking popups
- **Fix**: 
  - Look for popup blocker icon in address bar
  - Allow popups for localhost
  - Or use the "Try Google Sign-In (Redirect)" button

**Error: `auth/unauthorized-domain`**
- **Cause**: Domain not authorized
- **Fix**: This shouldn't happen on localhost, but if it does:
  1. Go to Firebase Console → Authentication → Settings → Authorized domains
  2. Make sure `localhost` is in the list

### 5. Browser-Specific Fixes

**Chrome:**
```
Settings → Privacy and security → Site Settings → Pop-ups and redirects → Allow → Add [*.]localhost
```

**Safari:**
```
Preferences → Websites → Pop-up Windows → localhost → Allow
```

### 6. Clear Cache and Cookies
Sometimes old auth tokens cause issues:
```bash
# In Chrome DevTools
# 1. Right-click → Inspect
# 2. Application tab → Storage → Clear site data
```

### 7. Check Console for Errors

Open browser console (F12) and look for:
- Red error messages when clicking sign-in
- Network errors (403, 401)
- CORS errors

### 8. If Nothing Works - Nuclear Option

```bash
# 1. Stop the dev server
# 2. Clear everything and reinstall
cd /Users/prabeshkarkee/Desktop/blood-bank
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm install
cd client && npm install
cd ..
npm run dev
```

## What Should Happen When It Works

1. Click "Continue with Google" or test button
2. Google sign-in popup appears
3. Select your Google account
4. You're redirected to `/dashboard`
5. Based on your role, you see the appropriate dashboard

## Still Not Working?

Share these details:
1. What happens when you open `simple-google-test.html`?
2. What error message do you see in the diagnostics component?
3. Any errors in the browser console?
4. Which browser are you using?

The diagnostics component I added will give us specific information about what's failing.
