// Authentication System for JNJ Website
// Handles user sign-in, sign-up, and data synchronization with Firestore

(function() {
    'use strict';
    
    let auth = null;
    let db = null;
    let currentUser = null;
    
    // Initialize Firebase Auth
    function initAuth() {
        try {
            if (typeof firebaseConfig === 'undefined') {
                console.warn('Firebase config not found');
                return false;
            }
            
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded');
                return false;
            }
            
            // Initialize Firebase app if not already initialized
            try {
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(firebaseConfig);
                }
            } catch (initError) {
                // App might already be initialized, that's okay
                if (!initError.message.includes('already exists')) {
                    console.error('Firebase initialization error:', initError);
                    return false;
                }
            }
            
            // Initialize Auth and Firestore
            try {
                auth = firebase.auth();
                db = firebase.firestore();
            } catch (authError) {
                console.error('Error accessing Firebase Auth:', authError);
                return false;
            }
            
            // Check if auth is available
            if (!auth) {
                console.warn('Firebase Auth is not available');
                return false;
            }
            
            // Listen for auth state changes
            try {
                auth.onAuthStateChanged((user) => {
                    currentUser = user;
                    if (user) {
                        console.log('User signed in:', user.email);
                        loadUserData(user.uid);
                    } else {
                        console.log('User signed out');
                        clearUserData();
                    }
                    // Dispatch custom event for other scripts
                    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
                });
            } catch (stateError) {
                console.error('Error setting up auth state listener:', stateError);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Firebase Auth initialization error:', error);
            return false;
        }
    }
    
    // Sign up new user
    async function signUp(email, password) {
        try {
            // Ensure auth is initialized
            if (!auth) {
                if (!initAuth()) {
                    return { 
                        success: false, 
                        error: 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console. See FIREBASE_AUTH_SETUP.md for instructions.' 
                    };
                }
            }
            
            if (!auth) {
                return { 
                    success: false, 
                    error: 'Firebase Authentication is not available. Please enable it in Firebase Console.' 
                };
            }
            
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create user document in Firestore
            const userData = {
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                secrets: {},
                profile: {
                    displayName: '',
                    username: '',
                    bio: '',
                    themeColor: '#667eea',
                    avatar: '👤',
                    avatarImage: null
                },
                isDev: false
            };
            
            // Sync existing localStorage data if any
            const existingSecrets = localStorage.getItem('jnjSecretPages');
            if (existingSecrets) {
                try {
                    userData.secrets = JSON.parse(existingSecrets);
                } catch (e) {
                    console.error('Error parsing existing secrets:', e);
                }
            }
            
            const existingProfile = localStorage.getItem('jnjUserProfile');
            if (existingProfile) {
                try {
                    const profile = JSON.parse(existingProfile);
                    // Generate numeric user ID if it doesn't exist
                    let numericId = profile.userNumericId;
                    if (!numericId) {
                        numericId = parseInt(Date.now().toString().slice(-10)) + Math.floor(Math.random() * 1000);
                    }
                    userData.profile = {
                        displayName: profile.displayName || '',
                        username: profile.username || '',
                        bio: profile.bio || '',
                        themeColor: profile.themeColor || '#667eea',
                        avatar: profile.avatar || '👤',
                        avatarImage: profile.avatarImage || null,
                        userNumericId: numericId
                    };
                    userData.isDev = profile.isDev || false;
                } catch (e) {
                    console.error('Error parsing existing profile:', e);
                }
            } else {
                // numericId is already set in the initial userData.profile above
            }
            
            await db.collection('users').doc(user.uid).set(userData);
            
            // Sync to localStorage
            syncToLocalStorage(userData);
            
            return { success: true, user };
        } catch (error) {
            console.error('Sign up error:', error);
            let errorMessage = error.message || 'Failed to create account';
            
            // Provide helpful error messages
            if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console. See FIREBASE_AUTH_SETUP.md for instructions.';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use at least 6 characters.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address. Please check your email.';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Sign in existing user
    async function signIn(email, password) {
        try {
            // Ensure auth is initialized
            if (!auth) {
                if (!initAuth()) {
                    return { 
                        success: false, 
                        error: 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console. See FIREBASE_AUTH_SETUP.md for instructions.' 
                    };
                }
            }
            
            if (!auth) {
                return { 
                    success: false, 
                    error: 'Firebase Authentication is not available. Please enable it in Firebase Console.' 
                };
            }
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Load user data will be handled by onAuthStateChanged
            return { success: true, user };
        } catch (error) {
            console.error('Sign in error:', error);
            let errorMessage = error.message || 'Failed to sign in';
            
            // Provide helpful error messages
            if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console. See FIREBASE_AUTH_SETUP.md for instructions.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please create an account first.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address. Please check your email.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password. Please try again.';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Sign out
    async function signOut() {
        try {
            if (auth) {
                await auth.signOut();
                return { success: true };
            }
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Load user data from Firestore
    async function loadUserData(userId) {
        try {
            if (!db) return;
            
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                syncToLocalStorage(userData);
                return userData;
            } else {
                // Create default user document if it doesn't exist
                const defaultData = {
                    email: currentUser?.email || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    secrets: {},
                    profile: {
                        displayName: '',
                        username: '',
                        bio: '',
                        themeColor: '#667eea',
                        avatar: '👤',
                        avatarImage: null
                    },
                    isDev: false
                };
                await db.collection('users').doc(userId).set(defaultData);
                syncToLocalStorage(defaultData);
                return defaultData;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    }
    
    // Sync Firestore data to localStorage
    function syncToLocalStorage(userData) {
        if (!userData) return;
        
        // Sync secrets
        if (userData.secrets) {
            localStorage.setItem('jnjSecretPages', JSON.stringify(userData.secrets));
        }
        
        // Sync profile
        if (userData.profile) {
            const profileData = {
                ...userData.profile,
                isDev: userData.isDev || false,
                userId: currentUser?.uid || ''
            };
            localStorage.setItem('jnjUserProfile', JSON.stringify(profileData));
        }
    }
    
    // Save user data to Firestore
    async function saveUserData(data) {
        try {
            if (!db || !currentUser) return { success: false, error: 'Not authenticated' };
            
            const updateData = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (data.secrets !== undefined) {
                updateData.secrets = data.secrets;
            }
            
            if (data.profile !== undefined) {
                updateData.profile = data.profile;
            }
            
            if (data.isDev !== undefined) {
                updateData.isDev = data.isDev;
            }
            
            await db.collection('users').doc(currentUser.uid).update(updateData);
            
            // Also update localStorage
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                syncToLocalStorage(userDoc.data());
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error saving user data:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Clear user data from localStorage
    function clearUserData() {
        localStorage.removeItem('jnjSecretPages');
        localStorage.removeItem('jnjUserProfile');
    }
    
    // Get current user
    function getUser() {
        return currentUser;
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
        return currentUser !== null;
    }
    
    // Initialize on load - wait for Firebase SDKs to be ready
    function waitForFirebase() {
        if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
            // Firebase is ready, initialize auth
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(initAuth, 100);
                });
            } else {
                setTimeout(initAuth, 100);
            }
        } else {
            // Firebase not loaded yet, wait a bit more (max 5 seconds)
            if (typeof window.firebaseWaitCount === 'undefined') {
                window.firebaseWaitCount = 0;
            }
            window.firebaseWaitCount++;
            if (window.firebaseWaitCount < 50) { // 5 seconds max
                setTimeout(waitForFirebase, 100);
            } else {
                console.warn('Firebase SDKs did not load in time. Auth may not work.');
            }
        }
    }
    
    // Start waiting for Firebase
    waitForFirebase();
    
    // Export to window
    window.authSystem = {
        signUp,
        signIn,
        signOut,
        getUser,
        isAuthenticated,
        saveUserData,
        loadUserData,
        getCurrentUser: () => currentUser
    };
})();

