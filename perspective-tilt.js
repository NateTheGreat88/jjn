// Perspective Tilt Effect - 3D tilt based on mouse position
(function() {
    let isEnabled = false; // Start disabled by default
    let maxTilt = 5; // Maximum tilt angle in degrees
    let perspective = 1000; // CSS perspective value
    let container = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let animationFrameId = null;
    let listenersAttached = false;
    
    function initPerspectiveTilt() {
        // Check if enabled in localStorage
        const saved = localStorage.getItem('perspectiveTiltEnabled');
        if (saved !== null) {
            isEnabled = saved === 'true';
        } else {
            // Default to disabled
            isEnabled = false;
        }
        
        // Get container
        container = document.querySelector('.container');
        if (!container) {
            // Wait a bit for DOM to load
            setTimeout(initPerspectiveTilt, 100);
            return;
        }
        
        // Apply perspective to body
        document.body.style.perspective = `${perspective}px`;
        document.body.style.perspectiveOrigin = 'center center';
        document.body.style.overflowX = 'hidden';
        
        // Apply transform style to container
        container.style.transition = 'transform 0.1s ease-out';
        container.style.transformStyle = 'preserve-3d';
        
        // Create toggle button (always create, even if disabled)
        createToggleButton();
        
        if (!isEnabled) {
            container.style.transform = 'rotateX(0deg) rotateY(0deg)';
            // Stop animation if running
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            return;
        }
        
        // Track mouse movement (only attach once)
        if (!listenersAttached) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);
            listenersAttached = true;
        }
        
        // Smooth animation loop
        function animate() {
            if (!isEnabled || !container) {
                animationFrameId = null;
                return;
            }
            
            // Smooth interpolation
            currentRotateX += (targetRotateX - currentRotateX) * 0.1;
            currentRotateY += (targetRotateY - currentRotateY) * 0.1;
            
            // Apply transform
            container.style.transform = `
                rotateX(${currentRotateX}deg) 
                rotateY(${currentRotateY}deg)
            `;
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // Start animation if not already running
        if (!animationFrameId) {
            animate();
        }
    }
    
    function handleMouseMove(e) {
        if (!isEnabled || !container) return;
        
        // Calculate mouse position relative to center of viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Calculate tilt angles (inverse for natural feel)
        const deltaX = (e.clientX - centerX) / centerX;
        const deltaY = (e.clientY - centerY) / centerY;
        
        targetRotateY = -deltaX * maxTilt; // Negative for natural tilt
        targetRotateX = deltaY * maxTilt;
    }
    
    function handleMouseLeave() {
        targetRotateX = 0;
        targetRotateY = 0;
    }
    
    function createToggleButton() {
        // Check if button already exists
        if (document.getElementById('perspectiveTiltToggle')) return;
        
        const button = document.createElement('button');
        button.id = 'perspectiveTiltToggle';
        button.className = 'perspective-tilt-toggle';
        button.innerHTML = '🎯';
        button.title = 'Toggle 3D Perspective Tilt';
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
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
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Update button state
        function updateButtonState() {
            if (isEnabled) {
                button.style.opacity = '1';
                button.style.background = 'rgba(74, 158, 255, 0.3)';
                button.style.borderColor = 'rgba(74, 158, 255, 0.5)';
                button.title = 'Disable 3D Perspective Tilt';
            } else {
                button.style.opacity = '0.5';
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                button.title = 'Enable 3D Perspective Tilt';
                
                // Reset tilt when disabled
                if (container) {
                    container.style.transform = 'rotateX(0deg) rotateY(0deg)';
                }
                targetRotateX = 0;
                targetRotateY = 0;
                currentRotateX = 0;
                currentRotateY = 0;
                
                // Stop animation
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        }
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            button.style.transform = 'scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            if (isEnabled) {
                button.style.background = 'rgba(74, 158, 255, 0.3)';
            } else {
                button.style.background = 'rgba(255, 255, 255, 0.1)';
            }
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('click', () => {
            isEnabled = !isEnabled;
            localStorage.setItem('perspectiveTiltEnabled', isEnabled.toString());
            updateButtonState();
            
            if (isEnabled) {
                initPerspectiveTilt();
            }
        });
        
        document.body.appendChild(button);
        updateButtonState();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerspectiveTilt);
    } else {
        initPerspectiveTilt();
    }
})();
