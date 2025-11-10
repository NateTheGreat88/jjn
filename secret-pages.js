// Secret Pages System
(function() {
    const SECRET_STORAGE_KEY = 'jnjSecretPages';
    
    // Secret pages configuration
    const secrets = {
        'konami': {
            name: 'Konami Code',
            page: 'secret-konami.html',
            hint: 'Try the classic cheat code...',
            unlocked: false
        },
        'header': {
            name: 'Header Secret',
            page: 'secret-header.html',
            hint: 'Click the header 7 times...',
            unlocked: false
        },
        'footer': {
            name: 'Footer Secret',
            page: 'secret-footer.html',
            hint: 'Look carefully at the footer...',
            unlocked: false
        },
        'search': {
            name: 'Search Secret',
            page: 'secret-search.html',
            hint: 'Type "secret" in the search...',
            unlocked: false
        },
        'cursor': {
            name: 'Cursor Secret',
            page: 'secret-cursor.html',
            hint: 'Draw a circle with your cursor...',
            unlocked: false
        }
    };
    
    // Load discovered secrets
    function loadSecrets() {
        const saved = localStorage.getItem(SECRET_STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.keys(secrets).forEach(key => {
                    if (data[key]) {
                        secrets[key].unlocked = true;
                    }
                });
            } catch (e) {
                console.error('Error loading secrets:', e);
            }
        }
    }
    
    // Save discovered secrets
    function saveSecrets() {
        const data = {};
        Object.keys(secrets).forEach(key => {
            data[key] = secrets[key].unlocked;
        });
        localStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(data));
    }
    
    // Unlock a secret
    function unlockSecret(key) {
        if (secrets[key] && !secrets[key].unlocked) {
            secrets[key].unlocked = true;
            saveSecrets();
            showSecretNotification(secrets[key].name);
            return true;
        }
        return false;
    }
    
    // Show notification when secret is discovered
    function showSecretNotification(secretName) {
        const notification = document.createElement('div');
        notification.className = 'secret-notification';
        notification.innerHTML = `
            <div class="secret-notification-content">
                <span class="secret-notification-icon">🔓</span>
                <div>
                    <div class="secret-notification-title">Secret Discovered!</div>
                    <div class="secret-notification-text">${secretName}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Check if secret is unlocked
    function isUnlocked(key) {
        return secrets[key] && secrets[key].unlocked;
    }
    
    // Get all secrets
    function getAllSecrets() {
        return secrets;
    }
    
    // Initialize
    loadSecrets();
    
    // Export to window
    window.secretPages = {
        unlock: unlockSecret,
        isUnlocked: isUnlocked,
        getAll: getAllSecrets,
        load: loadSecrets,
        save: saveSecrets
    };
    
    // ==================== KONAMI CODE ====================
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konamiSequence.length) {
            let match = true;
            for (let i = 0; i < konamiSequence.length; i++) {
                if (konamiCode[i] !== konamiSequence[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                if (unlockSecret('konami')) {
                    setTimeout(() => {
                        window.location.href = 'secrets.html';
                    }, 1500);
                } else if (isUnlocked('konami')) {
                    window.location.href = 'secrets.html';
                }
                konamiCode = [];
            }
        }
    });
    
    // ==================== HEADER CLICK SECRET ====================
    let headerClickCount = 0;
    let headerClickTimeout = null;
    
    document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('header h1');
        if (header) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                headerClickCount++;
                
                if (headerClickTimeout) {
                    clearTimeout(headerClickTimeout);
                }
                
                headerClickTimeout = setTimeout(() => {
                    headerClickCount = 0;
                }, 2000);
                
                if (headerClickCount === 7) {
                    if (unlockSecret('header')) {
                        setTimeout(() => {
                            window.location.href = 'secrets.html';
                        }, 1500);
                    } else if (isUnlocked('header')) {
                        window.location.href = 'secrets.html';
                    }
                    headerClickCount = 0;
                }
            });
        }
    });
    
    // ==================== SEARCH SECRET ====================
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value.toLowerCase().trim();
                if (value === 'secret' || value === 'secrets') {
                    if (unlockSecret('search')) {
                        setTimeout(() => {
                            window.location.href = 'secrets.html';
                        }, 1500);
                    } else if (isUnlocked('search')) {
                        window.location.href = 'secrets.html';
                    }
                }
            });
        }
    });
    
    // ==================== FOOTER SECRET ====================
    document.addEventListener('DOMContentLoaded', () => {
        const footerLink = document.querySelector('.secret-footer-link');
        if (footerLink) {
            // Position the link over the copyright area
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.style.position = 'relative';
                const footerYear = footer.querySelector('.footer-year');
                if (footerYear) {
                    footerLink.style.position = 'absolute';
                    footerLink.style.right = '20px';
                    footerLink.style.bottom = '10px';
                    footerLink.style.width = '30px';
                    footerLink.style.height = '30px';
                }
            }
            
            footerLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (unlockSecret('footer')) {
                    setTimeout(() => {
                        window.location.href = 'secrets.html';
                    }, 1500);
                } else if (isUnlocked('footer')) {
                    window.location.href = 'secrets.html';
                }
            });
        }
    });
    
    // ==================== SECRET MASTER PAGE ACCESS ====================
    // Accessible by typing "secrets" while holding Ctrl/Cmd
    let secretMasterSequence = [];
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            secretMasterSequence.push(e.key.toLowerCase());
            if (secretMasterSequence.length > 7) {
                secretMasterSequence.shift();
            }
            
            const target = 'secrets';
            if (secretMasterSequence.join('') === target) {
                window.location.href = 'secrets.html';
                secretMasterSequence = [];
            }
        } else {
            secretMasterSequence = [];
        }
    });
    
    // ==================== CURSOR CIRCLE SECRET ====================
    let cursorPath = [];
    let lastCursorTime = 0;
    const CIRCLE_THRESHOLD = 50; // Minimum points for a circle
    const CIRCLE_TIME_LIMIT = 3000; // 3 seconds to complete circle
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastCursorTime > 50) { // Sample every 50ms
            cursorPath.push({ x: e.clientX, y: e.clientY, time: now });
            lastCursorTime = now;
            
            // Remove old points
            cursorPath = cursorPath.filter(p => now - p.time < CIRCLE_TIME_LIMIT);
            
            if (cursorPath.length >= CIRCLE_THRESHOLD) {
                if (isCircle(cursorPath)) {
                    if (unlockSecret('cursor')) {
                        setTimeout(() => {
                            window.location.href = 'secrets.html';
                        }, 1500);
                    } else if (isUnlocked('cursor')) {
                        window.location.href = 'secrets.html';
                    }
                    cursorPath = [];
                }
            }
        }
    });
    
    function isCircle(path) {
        if (path.length < CIRCLE_THRESHOLD) return false;
        
        // Calculate center
        let sumX = 0, sumY = 0;
        for (let p of path) {
            sumX += p.x;
            sumY += p.y;
        }
        const centerX = sumX / path.length;
        const centerY = sumY / path.length;
        
        // Calculate average distance from center
        let sumDist = 0;
        for (let p of path) {
            const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
            sumDist += dist;
        }
        const avgDist = sumDist / path.length;
        
        // Check if most points are roughly the same distance from center (circle)
        let withinRange = 0;
        for (let p of path) {
            const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
            if (Math.abs(dist - avgDist) < avgDist * 0.3) { // Within 30% of average
                withinRange++;
            }
        }
        
        return withinRange / path.length > 0.7; // 70% of points form a circle
    }
})();

