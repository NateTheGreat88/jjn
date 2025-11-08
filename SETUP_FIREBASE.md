# Firebase Setup Guide for JJN Chat

## Quick Setup Steps

### 1. Create Firebase Account
- Go to https://console.firebase.google.com/
- Sign in with Google account
- Click "Add project" or "Create a project"
- Name it (e.g., "JJN Website Chat")
- Disable Google Analytics (optional)
- Click "Create project"

### 2. Create Firestore Database
- In Firebase Console, click "Firestore Database" in left sidebar
- Click "Create database"
- Select **"Start in test mode"** (for development)
- Choose a location (pick closest to your users)
- Click "Enable"

### 3. Set Up Security Rules
- In Firestore, go to "Rules" tab
- Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, write: if true;
    }
  }
}
```

- Click "Publish"

**Note:** You may see a link to create an index. Click it if it appears, or:
- Go to Firestore > Indexes tab
- Click "Create Index" if needed
- Collection: `messages`
- Fields: `timestamp` (Descending)
- Click "Create"

### 4. Get Your Firebase Config
- Click gear icon ⚙️ next to "Project Overview"
- Select "Project settings"
- Scroll to "Your apps" section
- Click the web icon `</>`
- Register app with nickname: "JJN Chat"
- **Copy the `firebaseConfig` object**

### 5. Create Config File
- Copy `firebase-config.js.template` to `firebase-config.js`
- Replace all placeholder values with your actual Firebase config
- Example:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 6. Test It!
- Open `chat.html` in your browser
- Open browser console (F12)
- You should see: "Firebase connected successfully!"
- Send a message and check Firebase Console > Firestore to see it appear

## Important Notes

- **Free Tier Limits:**
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
  - 1GB storage
  - Perfect for small to medium chat apps!

- **Security:** The current rules allow anyone to read/write. For production, consider adding authentication.

- **Fallback:** If Firebase isn't configured, the chat will automatically use localStorage as a fallback.

## Troubleshooting

- **"Firebase config not found"**: Make sure `firebase-config.js` exists and has correct values
- **Messages not appearing**: Check browser console for errors, verify Firestore rules are published
- **Permission denied**: Make sure security rules are set to allow read/write

