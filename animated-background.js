// Interactive Background System
(function() {
    let canvas, ctx;
    let cursorParticles = []; // Particles that follow cursor
    let floatingParticles = []; // Particles that float independently
    let simpleDots = []; // Simple dots for 'none' option
    let ripples = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    let particleType = 'follow'; // 'follow', 'small', or 'none'
    let leafImages = []; // Array to store loaded leaf images
    let leafImagesLoaded = false;
    
    // Get particle type from localStorage or profile
    function getParticleType() {
        // Check localStorage first
        const stored = localStorage.getItem('particleType');
        if (stored) {
            return stored;
        }
        
        // Check profile
        try {
            const profile = JSON.parse(localStorage.getItem('jnjUserProfile') || '{}');
            if (profile.particleType) {
                return profile.particleType;
            }
        } catch (e) {
            // Ignore
        }
        
        return 'follow'; // Default
    }
    
    // Update particle type
    function updateParticleType(newType) {
        particleType = newType;
        localStorage.setItem('particleType', newType);
    }
    
    // Expose update function
    window.animatedBackground = {
        updateParticleType: updateParticleType
    };
    
    // Load leaf images
    function loadLeafImages() {
        return new Promise((resolve) => {
            const leafPaths = ['leaf1.png', 'leaf2.png', 'leaf3.png'];
            let loadedCount = 0;
            
            leafPaths.forEach((path, index) => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === leafPaths.length) {
                        leafImagesLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    // If image fails to load, create a placeholder
                    console.warn(`Failed to load ${path}, using placeholder`);
                    loadedCount++;
                    if (loadedCount === leafPaths.length) {
                        leafImagesLoaded = true;
                        resolve();
                    }
                };
                img.src = path;
                leafImages[index] = img;
            });
        });
    }
    
    // Create interactive background canvas
    function createInteractiveBackground() {
        // Remove existing canvas if present
        const existing = document.getElementById('animatedBackground');
        if (existing) {
            existing.remove();
        }
        
        canvas = document.createElement('canvas');
        canvas.id = 'animatedBackground';
        canvas.className = 'animated-background-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none'; // Don't block clicks on elements above
        document.body.appendChild(canvas);
        
        // Make body background transparent
        document.body.style.background = 'transparent';
        
        ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Load leaf images before creating particles
        loadLeafImages();
        
        // Create particles that follow cursor - better formation
        const numCursorParticles = 60;
        let lastMouseX = canvas.width / 2;
        let lastMouseY = canvas.height / 2;
        
        for (let i = 0; i < numCursorParticles; i++) {
            // Create a trailing cloud formation instead of circle
            const progress = i / numCursorParticles; // 0 to 1
            const angle = Math.random() * Math.PI * 2; // Random angle for spread
            const distance = Math.random() * 120 + 20; // Distance from cursor (20-140)
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            
            cursorParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height - 100, // Start above screen
                targetX: 0,
                targetY: 0,
                radius: Math.random() * 2.5 + 1.5,
                size: Math.random() * 20 + 15, // Size for leaf images (15-35px)
                ease: Math.random() * 0.015 + 0.005, // Much slower - 0.005 to 0.02
                hue: Math.random() * 360,
                offsetX: offsetX, // Offset from cursor
                offsetY: offsetY,
                driftSpeed: (Math.random() - 0.5) * 0.02, // Slow drift
                driftAngle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2, // Random initial rotation
                rotationSpeed: (Math.random() - 0.5) * 0.03, // Rotation while falling
                vx: 0, // Velocity for smoother physics
                vy: Math.random() * 0.5 + 0.3, // Initial falling speed
                leafIndex: Math.floor(Math.random() * 3) // Random leaf image (0, 1, or 2)
            });
        }
        
        // Create independent floating particles (fewer for 'small' option)
        const numFloatingParticles = 50;
        for (let i = 0; i < numFloatingParticles; i++) {
            floatingParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height - 100, // Start above screen
                vx: (Math.random() - 0.5) * 0.3, // Horizontal drift
                vy: Math.random() * 0.5 + 0.3, // Falling speed (0.3 to 0.8)
                radius: Math.random() * 2.5 + 1,
                size: Math.random() * 20 + 15, // Size for leaf images (15-35px)
                hue: Math.random() * 360,
                speed: Math.random() * 0.3 + 0.1,
                rotation: Math.random() * Math.PI * 2, // Random initial rotation
                rotationSpeed: (Math.random() - 0.5) * 0.03, // Rotation while falling
                leafIndex: Math.floor(Math.random() * 3) // Random leaf image (0, 1, or 2)
            });
        }
        
        // Helper function to check if point is on interactive element
        function isInteractiveElement(x, y) {
            const element = document.elementFromPoint(x, y);
            if (!element) return false;
            return element.tagName === 'A' || 
                   element.tagName === 'BUTTON' || 
                   element.closest('a') || 
                   element.closest('button') ||
                   element.closest('.song-card') ||
                   element.closest('.feature-item') ||
                   element.closest('.search-input') ||
                   element.closest('.about-button');
        }
        
        // Mouse move - update cursor position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        });
        
        // Click to create ripples (only if not clicking on interactive elements)
        document.addEventListener('click', (e) => {
            // Check if click is on an interactive element
            if (isInteractiveElement(e.clientX, e.clientY)) {
                return; // Don't create ripple if clicking on interactive element
            }
            
            // Create ripple
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                radius: 0,
                maxRadius: Math.random() * 150 + 100,
                speed: 3,
                opacity: 0.6,
                hue: (time * 50) % 360
            });
        });
        
        // Touch support for ripples
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            
            if (!isInteractiveElement(mouseX, mouseY)) {
                // Create ripple on touch
                ripples.push({
                    x: mouseX,
                    y: mouseY,
                    radius: 0,
                    maxRadius: 150,
                    speed: 3,
                    opacity: 0.6,
                    hue: (time * 50) % 360
                });
            }
        });
        
        // Create simple dots for 'none' option (using leaves)
        const numSimpleDots = 100;
        for (let i = 0; i < numSimpleDots; i++) {
            simpleDots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height - 100, // Start above screen
                vx: (Math.random() - 0.5) * 0.3, // Horizontal drift
                vy: Math.random() * 0.5 + 0.3, // Falling speed (0.3 to 0.8)
                radius: 1.5,
                opacity: Math.random() * 0.5 + 0.3,
                size: Math.random() * 20 + 15, // Size for leaf images (15-35px)
                rotation: Math.random() * Math.PI * 2, // Random initial rotation
                rotationSpeed: (Math.random() - 0.5) * 0.03, // Rotation while falling
                leafIndex: Math.floor(Math.random() * 3) // Random leaf image (0, 1, or 2)
            });
        }
        
        // Initialize particle type
        particleType = getParticleType();
        
        // Animate
        function animate() {
            time += 0.01;
            
            // Update particle type from storage (in case it changed)
            particleType = getParticleType();
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw base gradient background
            const gradient = ctx.createLinearGradient(
                0, 0, 
                canvas.width, 
                canvas.height
            );
            
            gradient.addColorStop(0, `rgba(${26 + Math.sin(time) * 20}, ${26 + Math.cos(time * 0.7) * 20}, ${46 + Math.sin(time * 1.3) * 20}, 0.95)`);
            gradient.addColorStop(0.3, `rgba(${22 + Math.sin(time * 1.2) * 15}, ${33 + Math.cos(time * 0.9) * 15}, ${62 + Math.sin(time * 1.1) * 15}, 0.95)`);
            gradient.addColorStop(0.6, `rgba(${15 + Math.sin(time * 0.8) * 25}, ${52 + Math.cos(time * 1.1) * 25}, ${96 + Math.sin(time * 0.9) * 25}, 0.95)`);
            gradient.addColorStop(1, `rgba(${74 + Math.sin(time * 1.3) * 30}, ${158 + Math.cos(time * 0.7) * 30}, ${255 + Math.sin(time * 1.2) * 30}, 0.95)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw radial gradient overlays
            for (let i = 0; i < 3; i++) {
                const x = canvas.width * (0.2 + i * 0.3) + Math.sin(time + i) * 100;
                const y = canvas.height * (0.3 + i * 0.2) + Math.cos(time * 0.8 + i) * 80;
                const radius = 300 + Math.sin(time * 0.5 + i) * 100;
                
                const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                radialGradient.addColorStop(0, `rgba(${74 + Math.sin(time + i) * 50}, ${158 + Math.cos(time * 0.7 + i) * 50}, ${255 + Math.sin(time * 1.2 + i) * 50}, 0.3)`);
                radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = radialGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Update and draw ripples
            ripples = ripples.filter(ripple => {
                ripple.radius += ripple.speed;
                ripple.opacity -= 0.01;
                
                if (ripple.radius > ripple.maxRadius || ripple.opacity <= 0) {
                    return false;
                }
                
                // Draw ripple
                const gradient = ctx.createRadialGradient(
                    ripple.x, ripple.y, 0,
                    ripple.x, ripple.y, ripple.radius
                );
                gradient.addColorStop(0, `hsla(${ripple.hue}, 70%, 60%, ${ripple.opacity})`);
                gradient.addColorStop(0.5, `hsla(${ripple.hue}, 70%, 60%, ${ripple.opacity * 0.5})`);
                gradient.addColorStop(1, `hsla(${ripple.hue}, 70%, 60%, 0)`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                return true;
            });
            
            // Update and draw independent floating particles
            // Show all for 'follow' and 'none', show fewer for 'small'
            if (particleType === 'small' || particleType === 'follow' || particleType === 'none') {
                const particlesToShow = particleType === 'small' 
                    ? floatingParticles.slice(0, 15) // Only show 15 for 'small'
                    : floatingParticles; // Show all for 'follow' and 'none'
                    
                particlesToShow.forEach(particle => {
                    // Update position - falling motion
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                
                // Wrap around edges - reset to top when falling off bottom
                if (particle.x < -50) particle.x = canvas.width + 50;
                if (particle.x > canvas.width + 50) particle.x = -50;
                if (particle.y > canvas.height + 50) {
                    particle.y = -50 - Math.random() * 100; // Reset to top with random offset
                    particle.x = Math.random() * canvas.width; // Random horizontal position
                }
                
                    // Add slight horizontal drift while falling
                    particle.vx += (Math.random() - 0.5) * 0.005;
                    
                    // Limit horizontal velocity but keep falling
                    const maxVelX = 0.5;
                    particle.vx = Math.max(-maxVelX, Math.min(maxVelX, particle.vx));
                    
                    // Update hue slowly
                    particle.hue = (particle.hue + particle.speed) % 360;
                    
                    // Draw floating particle as leaf image
                const alpha = 0.3 + Math.sin(time + particle.x * 0.01) * 0.2;
                    particle.rotation += particle.rotationSpeed;
                    
                    if (leafImagesLoaded && leafImages[particle.leafIndex]) {
                        ctx.save();
                        ctx.globalAlpha = alpha;
                        ctx.translate(particle.x, particle.y);
                        ctx.rotate(particle.rotation);
                        ctx.drawImage(leafImages[particle.leafIndex], -particle.size / 2, -particle.size / 2, particle.size, particle.size);
                        ctx.restore();
                    } else {
                        // Fallback to circle if images not loaded
                        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
                        ctx.shadowColor = `hsla(${particle.hue}, 70%, 60%, 0.6)`;
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            }
            
            // Draw simple dots for 'none' option (instead of cursor-following particles)
            if (particleType === 'none') {
                simpleDots.forEach(dot => {
                    // Update position - falling motion
                    dot.x += dot.vx;
                    dot.y += dot.vy;
                    
                    // Wrap around edges - reset to top when falling off bottom
                    if (dot.x < -50) dot.x = canvas.width + 50;
                    if (dot.x > canvas.width + 50) dot.x = -50;
                    if (dot.y > canvas.height + 50) {
                        dot.y = -50 - Math.random() * 100; // Reset to top with random offset
                        dot.x = Math.random() * canvas.width; // Random horizontal position
                    }
                    
                    // Add slight horizontal drift while falling
                    dot.vx += (Math.random() - 0.5) * 0.005;
                    
                    // Limit horizontal velocity but keep falling
                    const maxVelX = 0.5;
                    dot.vx = Math.max(-maxVelX, Math.min(maxVelX, dot.vx));
                    
                    // Update rotation
                    dot.rotation += dot.rotationSpeed;
                    
                    // Draw as leaf image
                    if (leafImagesLoaded && leafImages[dot.leafIndex]) {
                        ctx.save();
                        ctx.globalAlpha = dot.opacity;
                        ctx.translate(dot.x, dot.y);
                        ctx.rotate(dot.rotation);
                        ctx.drawImage(leafImages[dot.leafIndex], -dot.size / 2, -dot.size / 2, dot.size, dot.size);
                        ctx.restore();
                    } else {
                        // Fallback to circle if images not loaded
                        ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
            
            // Update and draw cursor-following particles (only if particleType is 'follow')
            if (particleType === 'follow') {
                cursorParticles.forEach((particle, i) => {
                // Always drifting - particles are always shifting
                particle.driftAngle += particle.driftSpeed;
                
                // Calculate target position - cloud formation around cursor
                // Add slow circular drift for organic movement
                const driftX = Math.cos(particle.driftAngle + time * 0.1) * 15;
                const driftY = Math.sin(particle.driftAngle + time * 0.1) * 15;
                
                particle.targetX = mouseX + particle.offsetX + driftX;
                particle.targetY = mouseY + particle.offsetY + driftY;
                
                // Calculate distance to target
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                
                // Much slower physics-based movement
                const targetVx = dx * particle.ease;
                const targetVy = dy * particle.ease;
                
                // Very slow velocity interpolation
                particle.vx += (targetVx - particle.vx) * 0.08; // Much slower response
                particle.vy += (targetVy - particle.vy) * 0.08;
                
                // Add falling component to the vertical velocity
                particle.vy += 0.1; // Constant falling acceleration
                
                // Apply velocity with damping
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Reset to top if falling off bottom
                if (particle.y > canvas.height + 50) {
                    particle.y = -50 - Math.random() * 100;
                    particle.x = Math.random() * canvas.width;
                    particle.vy = Math.random() * 0.5 + 0.3; // Reset falling speed
                }
                
                // Update hue with variation
                particle.hue = (particle.hue + 0.2 + Math.sin(time + i) * 0.15) % 360;
                
                // Dynamic alpha based on distance from cursor
                const distFromCursor = Math.sqrt(
                    Math.pow(particle.x - mouseX, 2) + 
                    Math.pow(particle.y - mouseY, 2)
                );
                const maxDist = 250;
                const distAlpha = Math.max(0.25, 1 - (distFromCursor / maxDist));
                const alpha = (0.5 + Math.sin(time + particle.x * 0.01) * 0.15) * distAlpha;
                
                // Update rotation
                particle.rotation += particle.rotationSpeed;
                
                // Draw particle as leaf image
                if (leafImagesLoaded && leafImages[particle.leafIndex]) {
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.drawImage(leafImages[particle.leafIndex], -particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    ctx.restore();
                } else {
                    // Fallback to circle if images not loaded
                    ctx.fillStyle = `hsla(${particle.hue}, 75%, 65%, ${alpha})`;
                    ctx.shadowColor = `hsla(${particle.hue}, 75%, 65%, ${alpha * 1.5})`;
                    ctx.shadowBlur = 10 + Math.sin(time + i) * 2;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                });
            }
            
            // Draw connecting lines between nearby particles
            if (particleType === 'follow' || particleType === 'small') {
                const allParticles = particleType === 'follow' 
                    ? [...cursorParticles, ...floatingParticles]
                    : floatingParticles.slice(0, 15); // Only first 15 for 'small'
                allParticles.forEach((particle, i) => {
                    allParticles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                            const alpha = (1 - distance / 150) * 0.15;
                        ctx.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });
            } else if (particleType === 'none') {
                // Draw connecting lines for dots and floating particles in 'none' mode
                const allParticles = [...simpleDots, ...floatingParticles];
                allParticles.forEach((particle, i) => {
                    allParticles.slice(i + 1).forEach(otherParticle => {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            const alpha = (1 - distance / 100) * 0.1;
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.stroke();
                        }
                    });
                });
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createInteractiveBackground);
    } else {
        createInteractiveBackground();
    }
    
    // Re-initialize on page transitions
    window.addEventListener('pageshow', () => {
        if (!document.getElementById('animatedBackground')) {
            setTimeout(createInteractiveBackground, 100);
        }
    });
})();
