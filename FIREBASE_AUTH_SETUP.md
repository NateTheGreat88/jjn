# Firebase Authentication Setup Guide

## Enable Firebase Authentication

To fix the "auth/configuration-not-found" error, you need to enable Firebase Authentication in your Firebase Console:

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `jnjcode-abc58`

2. **Enable Authentication**
   - In the left sidebar, click on **"Authentication"**
   - If you see a "Get started" button, click it
   - This will enable the Authentication service

3. **Enable Email/Password Sign-in Method**
   - In the Authentication page, click on the **"Sign-in method"** tab
   - Find **"Email/Password"** in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - Click **"Save"**

4. **Update Firestore Security Rules**
   - Go to **Firestore Database** > **Rules**
   - Update the rules to include the users collection (already done in `firestore-rules.txt`)
   - The rules should allow users to read/write only their own data:
   ```
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```
   - Click **"Publish"**

### After Setup:

Once Authentication is enabled, the sign-in and sign-up functionality will work properly. Users will be able to:
- Create accounts with email and password
- Sign in with their credentials
- Have their data (secrets, profile, dev status) synced to Firestore

### Testing:

After enabling Authentication, try:
1. Creating a new account
2. Signing in with that account
3. Checking that your data is saved and persists across page refreshes

