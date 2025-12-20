// Quest Tracking System
// Include this script on pages that should track quest progress

(function() {
    'use strict';
    
    const QUESTS_STORAGE_KEY = 'jnjQuests';
    
    // Quest definitions (must match quests.html)
    const QUEST_TYPES = {
        'visit-profile': 'visit-profile',
        'chat-messages': 'chat-messages',
        'visit-pages': 'visit-pages',
        'change-avatar': 'change-avatar',
        'first-purchase': 'first-purchase',
        'unlock-titles': 'unlock-titles',
        'complete-bio': 'complete-bio',
        'unlock-secret': 'unlock-secret'
    };
    
    // Track page visit
    function trackPageVisit() {
        try {
            let visitedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (!visitedPages.includes(currentPage)) {
                visitedPages.push(currentPage);
                localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
                updateQuestProgress('visit-pages', 1);
            }
        } catch (e) {
            console.error('Error tracking page visit:', e);
        }
    }
    
    // Update quest progress
    function updateQuestProgress(questType, amount = 1) {
        try {
            const questData = localStorage.getItem(QUESTS_STORAGE_KEY);
            let quests = [];
            
            if (questData) {
                quests = JSON.parse(questData);
            }
            
            // Find and update the quest
            const quest = quests.find(q => q.type === questType);
            if (quest && !quest.completed) {
                quest.current = Math.min(quest.current + amount, quest.target);
                if (quest.current >= quest.target) {
                    quest.completed = true;
                }
                localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(quests));
                
                // Save to Firebase if authenticated
                if (window.authSystem && window.authSystem.isAuthenticated()) {
                    saveQuestProgressToFirebase(quests);
                }
            }
        } catch (e) {
            console.error('Error updating quest progress:', e);
        }
    }
    
    // Save quest progress to Firebase
    async function saveQuestProgressToFirebase(quests) {
        try {
            if (!window.authSystem || !window.authSystem.isAuthenticated()) {
                return;
            }
            
            const user = window.authSystem.getUser();
            if (!user || !user.uid) {
                return;
            }
            
            if (typeof firebase === 'undefined' || !firebaseConfig) {
                return;
            }
            
            let db = null;
            try {
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(firebaseConfig);
                }
                db = firebase.firestore();
            } catch (e) {
                // Firebase might already be initialized
                if (firebase.apps && firebase.apps.length > 0) {
                    db = firebase.firestore();
                }
            }
            
            if (!db) {
                return;
            }
            
            const questData = quests.map(q => ({
                id: q.id,
                current: q.current,
                completed: q.completed
            }));
            
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            const profile = { ...(userData.profile || {}) };
            profile.quests = questData;
            
            if (userDoc.exists) {
                await db.collection('users').doc(user.uid).update({
                    profile: profile
                });
            } else {
                await db.collection('users').doc(user.uid).set({
                    profile: profile,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error('Error saving quest progress to Firebase:', e);
        }
    }
    
    // Track profile visit
    function trackProfileVisit() {
        if (window.location.pathname.includes('profile.html')) {
            updateQuestProgress('visit-profile', 1);
        }
    }
    
    // Track avatar change (call this from profile page when avatar is changed)
    window.trackAvatarChange = function() {
        updateQuestProgress('change-avatar', 1);
    };
    
    // Track bio completion (call this from profile page when bio is saved)
    window.trackBioCompletion = function() {
        updateQuestProgress('complete-bio', 1);
    };
    
    // Track title unlock (call this when a title is unlocked)
    window.trackTitleUnlock = function(count) {
        updateQuestProgress('unlock-titles', count || 1);
    };
    
    // Track secret unlock (call this when a secret is unlocked)
    window.trackSecretUnlock = function() {
        updateQuestProgress('unlock-secret', 1);
    };
    
    // Track purchase (call this from shop when a purchase is made)
    window.trackPurchase = function() {
        updateQuestProgress('purchases', 1);
    };
    
    // Track chat message (call this from chat when a message is sent)
    window.trackChatMessage = function() {
        updateQuestProgress('chat-messages', 1);
    };
    
    // Initialize tracking
    function initTracking() {
        // Track page visit
        trackPageVisit();
        
        // Track profile visit
        trackProfileVisit();
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }
})();

