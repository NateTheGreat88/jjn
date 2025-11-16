// Live Visitor Map - See where visitors are on the page
(function() {
    let db = null;
    let visitorId = null;
    let visitorName = 'Anonymous';
    let positionUpdateInterval = null;
    let visitorCursors = {};
    let isEnabled = false;
    let unsubscribeVisitors = null;
    
    // Initialize Firebase
    function initFirebase() {
        try {
            if (typeof firebaseConfig !== 'undefined' && typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                db = firebase.firestore();
                return true;
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
        return false;
    }
    
    // Generate unique visitor ID
    function generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get visitor name from profile or generate one
    function getVisitorName() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (profile.name) {
            return profile.name;
        }
        return 'Visitor ' + Math.floor(Math.random() * 1000);
    }
    
    // Create visitor cursor element
    function createVisitorCursor(visitorData) {
        const cursor = document.createElement('div');
        cursor.className = 'visitor-cursor';
        cursor.id = `visitor-${visitorData.id}`;
        cursor.style.position = 'fixed';
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.borderRadius = '50%';
        cursor.style.border = `2px solid ${visitorData.color}`;
        cursor.style.backgroundColor = `${visitorData.color}33`;
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9998';
        cursor.style.transition = 'opacity 0.3s ease';
        cursor.style.boxShadow = `0 0 10px ${visitorData.color}`;
        
        // Add name label
        const label = document.createElement('div');
        label.className = 'visitor-label';
        label.textContent = visitorData.name;
        label.style.position = 'absolute';
        label.style.top = '-25px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = visitorData.color;
        label.style.color = '#fff';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '11px';
        label.style.whiteSpace = 'nowrap';
        label.style.pointerEvents = 'none';
        label.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        cursor.appendChild(label);
        
        document.body.appendChild(cursor);
        return cursor;
    }
    
    // Update visitor cursor position
    function updateVisitorCursor(visitorData) {
        let cursor = document.getElementById(`visitor-${visitorData.id}`);
        
        if (!cursor) {
            cursor = createVisitorCursor(visitorData);
        }
        
        cursor.style.left = visitorData.x + 'px';
        cursor.style.top = visitorData.y + 'px';
        cursor.style.opacity = '1';
        
        // Update last seen time
        visitorCursors[visitorData.id] = {
            ...visitorData,
            lastSeen: Date.now()
        };
    }
    
    // Remove visitor cursor (when they leave)
    function removeVisitorCursor(visitorId) {
        const cursor = document.getElementById(`visitor-${visitorId}`);
        if (cursor) {
            cursor.style.opacity = '0';
            setTimeout(() => {
                if (cursor.parentNode) {
                    cursor.parentNode.removeChild(cursor);
                }
            }, 300);
        }
        delete visitorCursors[visitorId];
    }
    
    // Clean up old visitors (haven't updated in 5 seconds)
    function cleanupOldVisitors() {
        const now = Date.now();
        Object.keys(visitorCursors).forEach(id => {
            if (visitorCursors[id].lastSeen && now - visitorCursors[id].lastSeen > 5000) {
                removeVisitorCursor(id);
            }
        });
    }
    
    // Send position update to Firebase
    function sendPositionUpdate(x, y) {
        if (!db || !visitorId || !isEnabled) return;
        
        const visitorRef = db.collection('visitors').doc(visitorId);
        visitorRef.set({
            x: x,
            y: y,
            name: visitorName,
            color: getVisitorColor(visitorId),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname
        }, { merge: true }).catch(error => {
            console.error('Error updating position:', error);
        });
    }
    
    // Get consistent color for visitor ID
    function getVisitorColor(id) {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
            '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894',
            '#e17055', '#74b9ff', '#55efc4', '#ffeaa7'
        ];
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }
    
    // Track mouse movement
    function trackMousePosition() {
        if (!isEnabled) return;
        
        document.addEventListener('mousemove', (e) => {
            sendPositionUpdate(e.clientX, e.clientY);
        });
        
        // Also send periodic updates even if mouse doesn't move
        if (positionUpdateInterval) {
            clearInterval(positionUpdateInterval);
        }
        
        positionUpdateInterval = setInterval(() => {
            // Keep connection alive
            if (db && visitorId) {
                const visitorRef = db.collection('visitors').doc(visitorId);
                visitorRef.update({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});
            }
        }, 2000);
    }
    
    // Listen for other visitors
    function listenForVisitors() {
        if (!db) return;
        
        // Listen to all visitors on current page
        unsubscribeVisitors = db.collection('visitors')
            .where('page', '==', window.location.pathname)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const data = change.doc.data();
                    const id = change.doc.id;
                    
                    if (id === visitorId) return; // Skip self
                    
                    if (change.type === 'added' || change.type === 'modified') {
                        if (data.x && data.y) {
                            updateVisitorCursor({
                                id: id,
                                x: data.x,
                                y: data.y,
                                name: data.name || 'Anonymous',
                                color: data.color || getVisitorColor(id)
                            });
                        }
                    } else if (change.type === 'removed') {
                        removeVisitorCursor(id);
                    }
                });
                
                // Clean up old visitors
                cleanupOldVisitors();
            }, (error) => {
                console.error('Error listening for visitors:', error);
            });
    }
    
    // Clean up when leaving
    function cleanup() {
        if (positionUpdateInterval) {
            clearInterval(positionUpdateInterval);
        }
        
        if (unsubscribeVisitors) {
            unsubscribeVisitors();
        }
        
        // Remove self from Firebase
        if (db && visitorId) {
            db.collection('visitors').doc(visitorId).delete().catch(() => {});
        }
        
        // Remove all cursors
        Object.keys(visitorCursors).forEach(id => {
            removeVisitorCursor(id);
        });
        
        isEnabled = false;
    }
    
    // Enable/disable live visitor map
    function enable() {
        if (isEnabled) return;
        
        if (!initFirebase()) {
            console.warn('Firebase not available. Live visitor map requires Firebase.');
            return;
        }
        
        isEnabled = true;
        visitorId = generateVisitorId();
        visitorName = getVisitorName();
        
        // Clean up old visitors from Firebase (older than 10 seconds)
        if (db) {
            db.collection('visitors')
                .where('timestamp', '<', firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10000)))
                .get()
                .then(snapshot => {
                    snapshot.forEach(doc => doc.ref.delete());
                })
                .catch(() => {});
        }
        
        trackMousePosition();
        listenForVisitors();
        
        // Clean up on page unload
        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('pagehide', cleanup);
    }
    
    function disable() {
        cleanup();
    }
    
    // Create toggle button
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'liveVisitorToggle';
        button.className = 'live-visitor-toggle';
        button.innerHTML = '👥';
        button.title = 'Toggle Live Visitor Map';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            z-index: 10000;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            button.style.transform = 'scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(255, 255, 255, 0.1)';
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('click', () => {
            if (isEnabled) {
                disable();
                button.style.opacity = '0.5';
                button.title = 'Enable Live Visitor Map';
            } else {
                enable();
                button.style.opacity = '1';
                button.style.background = 'rgba(74, 158, 255, 0.3)';
                button.style.borderColor = 'rgba(74, 158, 255, 0.5)';
                button.title = 'Disable Live Visitor Map';
            }
        });
        
        document.body.appendChild(button);
        
        // Check if enabled in localStorage
        if (localStorage.getItem('liveVisitorMapEnabled') === 'true') {
            enable();
            button.style.opacity = '1';
            button.style.background = 'rgba(74, 158, 255, 0.3)';
            button.style.borderColor = 'rgba(74, 158, 255, 0.5)';
        } else {
            button.style.opacity = '0.5';
        }
        
        // Save state
        const originalEnable = enable;
        enable = function() {
            originalEnable();
            localStorage.setItem('liveVisitorMapEnabled', 'true');
        };
        
        const originalDisable = disable;
        disable = function() {
            originalDisable();
            localStorage.setItem('liveVisitorMapEnabled', 'false');
        };
    }
    
    // Initialize when DOM is ready
    function init() {
        // Wait a bit for Firebase scripts to load
        setTimeout(() => {
            createToggleButton();
        }, 1000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

