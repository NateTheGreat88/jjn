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
        'subtitle': {
            name: 'Subtitle Secret',
            page: 'secret-subtitle.html',
            hint: 'Double-click the subtitle...',
            unlocked: false
        },
        'rightclick': {
            name: 'Right-Click Secret',
            page: 'secret-rightclick.html',
            hint: 'Right-click on the header...',
            unlocked: false
        },
        'devtools': {
            name: 'Dev Tools Secret',
            page: 'secret-devtools.html',
            hint: 'Press Ctrl+Shift+J (or Cmd+Option+J)...',
            unlocked: false
        },
        'favicon': {
            name: 'Favicon Secret',
            page: 'secret-favicon.html',
            hint: 'Click the favicon 5 times...',
            unlocked: false
        },
        'chatcode': {
            name: 'Chat Code Secret',
            page: 'secret-chatcode.html',
            hint: 'Type "JNJ2025" in chat...',
            unlocked: false
        },
        'tripleclick': {
            name: 'Triple-Click Secret',
            page: 'secret-tripleclick.html',
            hint: 'Triple-click the "About Us" button...',
            unlocked: false
        }
    };
    
    // Load discovered secrets
    async function loadSecrets() {
        // Try to load from Firestore if authenticated
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            try {
                const userData = await window.authSystem.loadUserData(window.authSystem.getUser().uid);
                if (userData && userData.secrets) {
                    Object.keys(secrets).forEach(key => {
                        if (userData.secrets[key]) {
                            secrets[key].unlocked = true;
                        }
                    });
                    return;
                }
            } catch (e) {
                console.error('Error loading secrets from Firestore:', e);
            }
        }
        
        // Fallback to localStorage
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
    async function saveSecrets() {
        const data = {};
        Object.keys(secrets).forEach(key => {
            data[key] = secrets[key].unlocked;
        });
        
        // Save to localStorage
        localStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(data));
        
        // Also save to Firestore if authenticated
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            try {
                await window.authSystem.saveUserData({ secrets: data });
            } catch (e) {
                console.error('Error saving secrets to Firestore:', e);
            }
        }
    }
    
    // Unlock a secret
    async function unlockSecret(key) {
        if (secrets[key] && !secrets[key].unlocked) {
            secrets[key].unlocked = true;
            await saveSecrets();
            showSecretNotification(secrets[key].name);
            // Always redirect to secrets page when a secret is unlocked
            setTimeout(() => {
                window.location.href = 'secrets.html';
            }, 2000);
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
    // Wait for auth system to be ready
    function initSecrets() {
        if (window.authSystem) {
            loadSecrets();
        } else {
            // Wait a bit and try again
            setTimeout(initSecrets, 100);
        }
    }
    
    // Listen for auth state changes to reload secrets
    window.addEventListener('authStateChanged', () => {
        loadSecrets();
    });
    
    initSecrets();
    
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
                    // Redirect is handled in unlockSecret
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
                        // Redirect is handled in unlockSecret
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
                        // Redirect is handled in unlockSecret
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
            // Make sure the link is visible and clickable
            footerLink.style.display = 'block';
            footerLink.style.position = 'absolute';
            footerLink.style.right = '20px';
            footerLink.style.bottom = '10px';
            footerLink.style.width = '30px';
            footerLink.style.height = '30px';
            footerLink.style.opacity = '0.1';
            footerLink.style.cursor = 'pointer';
            footerLink.style.zIndex = '10';
            footerLink.style.textDecoration = 'none';
            footerLink.style.fontSize = '20px';
            footerLink.style.textAlign = 'center';
            footerLink.style.lineHeight = '30px';
            
            // Position the link over the copyright area
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.style.position = 'relative';
            }
            
            footerLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (unlockSecret('footer')) {
                    // Redirect is handled in unlockSecret
                } else if (isUnlocked('footer')) {
                    window.location.href = 'secrets.html';
                }
            });
            
            // Also make the footer year area clickable as a hint
            const footerYear = document.querySelector('.footer-year');
            if (footerYear) {
                footerYear.style.cursor = 'pointer';
                footerYear.style.position = 'relative';
                footerYear.title = 'Look for the secret...';
            }
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
    
    // ==================== SUBTITLE DOUBLE-CLICK SECRET ====================
    document.addEventListener('DOMContentLoaded', () => {
        const subtitle = document.querySelector('.subtitle, .chat-subtitle, .about-subtitle');
        if (subtitle) {
            let clickCount = 0;
            let clickTimeout = null;
            
            subtitle.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (unlockSecret('subtitle')) {
                    // Redirect is handled in unlockSecret
                } else if (isUnlocked('subtitle')) {
                    window.location.href = 'secrets.html';
                }
            });
        }
    });
    
    // ==================== RIGHT-CLICK HEADER SECRET ====================
    document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('header h1');
        if (header) {
            header.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (unlockSecret('rightclick')) {
                    // Redirect is handled in unlockSecret
                } else if (isUnlocked('rightclick')) {
                    window.location.href = 'secrets.html';
                }
                return false;
            });
        }
    });
    
    // ==================== DEV TOOLS SECRET ====================
    let devToolsSequence = [];
    document.addEventListener('keydown', (e) => {
        // Detect Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (Mac)
        if ((e.ctrlKey && e.shiftKey && e.key === 'J') || 
            (e.metaKey && e.altKey && e.key === 'J')) {
            if (unlockSecret('devtools')) {
                // Redirect is handled in unlockSecret
            } else if (isUnlocked('devtools')) {
                window.location.href = 'secrets.html';
            }
        }
    });
    
    // ==================== FAVICON CLICK SECRET ====================
    // Since we can't directly click the favicon in the browser tab,
    // we'll use clicks on the page title area (top-left corner)
    document.addEventListener('DOMContentLoaded', () => {
        let faviconClickCount = 0;
        let faviconClickTimeout = null;
        
        // Create invisible clickable area in top-left corner (where favicon would be conceptually)
        const faviconArea = document.createElement('div');
        faviconArea.style.position = 'fixed';
        faviconArea.style.top = '0';
        faviconArea.style.left = '0';
        faviconArea.style.width = '50px';
        faviconArea.style.height = '50px';
        faviconArea.style.zIndex = '10000';
        faviconArea.style.cursor = 'pointer';
        faviconArea.style.opacity = '0';
        faviconArea.style.backgroundColor = 'transparent';
        document.body.appendChild(faviconArea);
        
        faviconArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            faviconClickCount++;
            
            if (faviconClickTimeout) {
                clearTimeout(faviconClickTimeout);
            }
            
            faviconClickTimeout = setTimeout(() => {
                faviconClickCount = 0;
            }, 2000);
            
            if (faviconClickCount === 5) {
                if (unlockSecret('favicon')) {
                    // Redirect is handled in unlockSecret
                } else if (isUnlocked('favicon')) {
                    window.location.href = 'secrets.html';
                }
                faviconClickCount = 0;
            }
        });
    });
    
    // ==================== TRIPLE-CLICK ABOUT BUTTON SECRET ====================
    document.addEventListener('DOMContentLoaded', () => {
        const aboutButton = document.querySelector('.about-button');
        if (aboutButton) {
            let clickCount = 0;
            let clickTimeout = null;
            
            aboutButton.addEventListener('click', (e) => {
                clickCount++;
                
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                
                clickTimeout = setTimeout(() => {
                    if (clickCount === 3) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (unlockSecret('tripleclick')) {
                            // Redirect is handled in unlockSecret
                        } else if (isUnlocked('tripleclick')) {
                            window.location.href = 'secrets.html';
                        }
                    }
                    clickCount = 0;
                }, 500);
            });
        }
    });
})();

