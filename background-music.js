// Background Music System for JNJ Website
// Simple ambient instrumental that plays automatically as background noise

(function() {
    'use strict';
    
    // Use a single relaxing instrumental track
    // Change this to any of your MP3 files: 'A Sad Truth.mp3', 'You and I.mp3', 'stolen.mp3', 'phantomtaxersparadise.mp3'
    const MUSIC_FILE = 'A Sad Truth.mp3';
    const VOLUME = 0.2; // Low volume (20%) for ambient background noise
    
    let audioElement = null;
    let userInteracted = false;
    let isMuted = false;
    
    // Load mute preference from localStorage
    function loadPreferences() {
        try {
            const savedMuted = localStorage.getItem('bgMusicMuted');
            if (savedMuted !== null) {
                isMuted = savedMuted === 'true';
            }
        } catch (error) {
            console.warn('Could not load music preferences:', error);
        }
    }
    
    // Save mute preference
    function savePreferences() {
        try {
            localStorage.setItem('bgMusicMuted', isMuted.toString());
        } catch (error) {
            console.warn('Could not save music preferences:', error);
        }
    }
    
    // Initialize and play music
    function initAndPlay() {
        if (audioElement) return;
        
        audioElement = new Audio(MUSIC_FILE);
        audioElement.loop = true;
        audioElement.volume = isMuted ? 0 : VOLUME;
        audioElement.preload = 'auto';
        
        // Handle errors silently
        audioElement.addEventListener('error', function(e) {
            console.warn('Background music file not found or could not load');
        });
        
        // Try to play after user interaction
        if (userInteracted && !isMuted) {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Silently fail - browser may block autoplay
                });
            }
        }
    }
    
    // Enable music after first user interaction
    function enableMusic() {
        userInteracted = true;
        if (!isMuted) {
            initAndPlay();
        }
    }
    
    // Initialize on page load
    function init() {
        loadPreferences();
        
        // Wait for user interaction (required by browsers)
        document.addEventListener('click', enableMusic, { once: true });
        document.addEventListener('keydown', enableMusic, { once: true });
        document.addEventListener('touchstart', enableMusic, { once: true });
        
        // Also try to initialize audio (will play after interaction)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initAndPlay, 100);
            });
        } else {
            setTimeout(initAndPlay, 100);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
