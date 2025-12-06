// Interactive Background System
(function() {
    let canvas, ctx;
    let cursorParticles = []; // Particles that follow cursor
    let floatingParticles = []; // Particles that float independently
    let simpleDots = []; // Simple dots for 'none' option
    let ripples = [];
    let piledLeaves = []; // Leaves that have piled up at the bottom
    let fallingBoxes = []; // Falling box.png images
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    let particleType = 'follow'; // 'follow', 'small', or 'none'
    let leafImages = []; // Array to store loaded leaf images
    let leafImagesLoaded = false;
    let boxImage = null; // box.png image
    let boxImageLoaded = false;
    let lastBoxSpawnTime = 0; // Frame count of last box spawn
    let frameCount = 0; // Frame counter
    
    // Reset leaves to follow (Thanksgiving event is over) - run immediately
    (function resetLeavesOnLoad() {
        try {
            const stored = localStorage.getItem('particleType');
            if (stored === 'leaves') {
                localStorage.setItem('particleType', 'follow');
            }
            
            const profile = JSON.parse(localStorage.getItem('jnjUserProfile') || '{}');
            if (profile.particleType === 'leaves') {
                profile.particleType = 'follow';
                localStorage.setItem('jnjUserProfile', JSON.stringify(profile));
            }
        } catch (e) {
            // Ignore
        }
    })();
    
    // Get particle type from localStorage or profile
    function getParticleType() {
        // Always reset leaves if found (Thanksgiving event is over)
        const stored = localStorage.getItem('particleType');
        if (stored === 'leaves') {
            localStorage.setItem('particleType', 'follow');
        }
        
        try {
            const profile = JSON.parse(localStorage.getItem('jnjUserProfile') || '{}');
            if (profile.particleType === 'leaves') {
                profile.particleType = 'follow';
                localStorage.setItem('jnjUserProfile', JSON.stringify(profile));
            }
        } catch (e) {
            // Ignore
        }
        
        // Check localStorage first
        const storedAfterReset = localStorage.getItem('particleType');
        if (storedAfterReset && storedAfterReset !== 'leaves') {
            return storedAfterReset;
        }
        
        // Check profile
        try {
            const profile = JSON.parse(localStorage.getItem('jnjUserProfile') || '{}');
            if (profile.particleType && profile.particleType !== 'leaves') {
                return profile.particleType;
            }
        } catch (e) {
            // Ignore
        }
        
        return 'follow'; // Default
    }
    
    // Update particle type
    function updateParticleType(newType) {
        // Prevent setting to leaves (Thanksgiving event is over)
        if (newType === 'leaves') {
            newType = 'follow';
        }
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
    
    // Load box image
    function loadBoxImage() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                boxImage = img;
                boxImageLoaded = true;
                resolve();
            };
            img.onerror = () => {
                console.warn('Failed to load box.png');
                boxImageLoaded = true; // Mark as loaded even if failed
                resolve();
            };
            img.src = 'box.png';
        });
    }
    
    // Create a falling box
    function createFallingBox() {
        if (!boxImageLoaded || !boxImage) return;
        
        fallingBoxes.push({
            x: Math.random() * canvas.width,
            y: -50,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            fallSpeed: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
            size: 25 + Math.random() * 15, // 25 to 40px
            opacity: 0.15
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
        
        // Load leaf images and box image before creating particles
        loadLeafImages();
        loadBoxImage();
        
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
                y: Math.random() * canvas.height, // Start at random position on screen
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
                rotationSpeed: (Math.random() - 0.5) * 0.01, // Slow rotation
                vx: 0, // Velocity for smoother physics
                vy: 0, // No falling - floating particles
                leafIndex: Math.floor(Math.random() * 3) // Random leaf image (0, 1, or 2)
            });
        }
        
        // Create independent floating particles (fewer for 'small' option)
        const numFloatingParticles = 50;
        piledLeaves = []; // Reset piled leaves array
        for (let i = 0; i < numFloatingParticles; i++) {
            floatingParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height, // Start at random position on screen
                vx: (Math.random() - 0.5) * 0.2, // Horizontal drift
                vy: (Math.random() - 0.5) * 0.2, // Vertical drift (floating, not falling)
                radius: Math.random() * 2.5 + 1,
                size: Math.random() * 20 + 15, // Size for leaf images (15-35px)
                hue: Math.random() * 360,
                speed: Math.random() * 0.3 + 0.1,
                rotation: Math.random() * Math.PI * 2, // Random initial rotation
                rotationSpeed: (Math.random() - 0.5) * 0.01, // Slow rotation
                leafIndex: Math.floor(Math.random() * 3), // Random leaf image (0, 1, or 2)
                grounded: false // Track if leaf has reached the ground
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
        
        // Create simple dots for 'none' option
        const numSimpleDots = 100;
        for (let i = 0; i < numSimpleDots; i++) {
            simpleDots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height, // Start at random position on screen
                vx: (Math.random() - 0.5) * 0.2, // Horizontal drift
                vy: (Math.random() - 0.5) * 0.2, // Vertical drift (floating, not falling)
                radius: 1.5,
                opacity: Math.random() * 0.5 + 0.3,
                size: Math.random() * 20 + 15, // Size for leaf images (15-35px)
                rotation: Math.random() * Math.PI * 2, // Random initial rotation
                rotationSpeed: (Math.random() - 0.5) * 0.01, // Slow rotation
                leafIndex: Math.floor(Math.random() * 3) // Random leaf image (0, 1, or 2)
            });
        }
        
        // Initialize particle type
        particleType = getParticleType();
        
        // Animate
        function animate() {
            time += 0.01;
            frameCount++;
            
            // Update particle type from storage (in case it changed)
            // Always reset leaves to follow
            const newParticleType = getParticleType();
            if (newParticleType === 'leaves' || particleType === 'leaves') {
                particleType = 'follow';
            } else {
                particleType = newParticleType;
            }
            
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
            // Note: 'leaves' is disabled (Thanksgiving event is over)
            if (particleType === 'small' || particleType === 'follow' || particleType === 'none') {
                const particlesToShow = particleType === 'small' 
                    ? floatingParticles.slice(0, 15) // Only show 15 for 'small'
                    : floatingParticles; // Show all for 'follow' and 'none'
                
                // Note: 'leaves' mode is disabled (Thanksgiving event is over)
                // Piled leaves drawing code removed
                    
                const particlesToGround = []; // Collect particles that need to be grounded
                
                particlesToShow.forEach(particle => {
                    if (particle.grounded) {
                        // Skip grounded particles - they're drawn separately
                        return;
                    }
                    
                    // Update position - floating motion
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                
                    // Wrap around all edges (floating particles)
                    if (particle.x < -50) particle.x = canvas.width + 50;
                    if (particle.x > canvas.width + 50) particle.x = -50;
                    if (particle.y < -50) particle.y = canvas.height + 50;
                    if (particle.y > canvas.height + 50) particle.y = -50;
                
                    // Add slight random drift (floating motion)
                    if (!particle.grounded) {
                        particle.vx += (Math.random() - 0.5) * 0.002;
                        particle.vy += (Math.random() - 0.5) * 0.002;
                        
                        // Limit velocity for smooth floating
                        const maxVel = 0.3;
                        particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
                        particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
                    }
                    
                    // Update hue slowly
                    particle.hue = (particle.hue + particle.speed) % 360;
                    
                    // Draw floating particle as regular particle (no leaves)
                    const alpha = 0.3 + Math.sin(time + particle.x * 0.01) * 0.2;
                    
                    ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
                    ctx.shadowColor = `hsla(${particle.hue}, 70%, 60%, 0.6)`;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
                
                // Process particles that need to be grounded (after loop to avoid modification issues)
                // Note: 'leaves' mode is disabled (Thanksgiving event is over)
                if (false && particleType === 'leaves') {
                    particlesToGround.forEach(particle => {
                        // Find the highest point in the pile near this leaf's x position
                        const pileRadius = particle.size;
                        let maxPileHeight = canvas.height;
                        
                        // Check all piled leaves to find the top of the pile at this x position
                        piledLeaves.forEach(piledLeaf => {
                            const distance = Math.abs(piledLeaf.x - particle.x);
                            if (distance < pileRadius) {
                                const leafTop = piledLeaf.y - piledLeaf.size / 2;
                                if (leafTop < maxPileHeight) {
                                    maxPileHeight = leafTop;
                                }
                            }
                        });
                        
                        // Place leaf on top of the pile
                        particle.y = maxPileHeight - particle.size / 2;
                        particle.vy = 0;
                        particle.vx = 0;
                        particle.rotationSpeed = (Math.random() - 0.5) * 0.01; // Slower rotation when grounded
                        particle.grounded = true;
                        piledLeaves.push(particle);
                        
                        // Limit pile size to prevent memory issues (keep last 200 leaves)
                        if (piledLeaves.length > 200) {
                            piledLeaves.shift(); // Remove oldest leaves
                        }
                        
                        // Remove from floating particles (it's now in the pile)
                        const index = floatingParticles.indexOf(particle);
                        if (index > -1) {
                            floatingParticles.splice(index, 1);
                        }
                        
                        // Create a new falling leaf to replace it
                        floatingParticles.push({
                            x: Math.random() * canvas.width,
                            y: -50 - Math.random() * 100,
                            vx: (Math.random() - 0.5) * 0.3,
                            vy: Math.random() * 0.5 + 0.3,
                            radius: Math.random() * 2.5 + 1,
                            size: Math.random() * 20 + 15,
                            hue: Math.random() * 360,
                            speed: Math.random() * 0.3 + 0.1,
                            rotation: Math.random() * Math.PI * 2,
                            rotationSpeed: (Math.random() - 0.5) * 0.03,
                            leafIndex: Math.floor(Math.random() * 3),
                            grounded: false
                        });
                    });
                }
            }
            
            // Draw simple dots for 'none' option (instead of cursor-following particles)
            if (particleType === 'none') {
                simpleDots.forEach(dot => {
                    // Update position - falling motion
                    dot.x += dot.vx;
                    dot.y += dot.vy;
                    
                    // Wrap around all edges (floating particles)
                    if (dot.x < -50) dot.x = canvas.width + 50;
                    if (dot.x > canvas.width + 50) dot.x = -50;
                    if (dot.y < -50) dot.y = canvas.height + 50;
                    if (dot.y > canvas.height + 50) dot.y = -50;
                    
                    // Add slight random drift (floating motion)
                    dot.vx += (Math.random() - 0.5) * 0.002;
                    dot.vy += (Math.random() - 0.5) * 0.002;
                    
                    // Limit velocity for smooth floating
                    const maxVel = 0.3;
                    dot.vx = Math.max(-maxVel, Math.min(maxVel, dot.vx));
                    dot.vy = Math.max(-maxVel, Math.min(maxVel, dot.vy));
                    
                    // Update rotation
                    dot.rotation += dot.rotationSpeed;
                    
                    // Draw as regular particle (no leaves)
                    ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            
            // Update and draw cursor-following particles (only if particleType is 'follow')
            // Note: 'leaves' mode is disabled (Thanksgiving event is over)
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
                
                // Apply velocity with damping
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges (floating particles)
                if (particle.x < -50) particle.x = canvas.width + 50;
                if (particle.x > canvas.width + 50) particle.x = -50;
                if (particle.y < -50) particle.y = canvas.height + 50;
                if (particle.y > canvas.height + 50) particle.y = -50;
                
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
                
                // Draw particle as regular particle (no leaves)
                ctx.fillStyle = `hsla(${particle.hue}, 75%, 65%, ${alpha})`;
                ctx.shadowColor = `hsla(${particle.hue}, 75%, 65%, ${alpha * 1.5})`;
                ctx.shadowBlur = 10 + Math.sin(time + i) * 2;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                });
            }
            
            // Update and draw falling boxes (occasional)
            if (boxImageLoaded && boxImage) {
                // Spawn boxes occasionally (every 8-15 seconds)
                // At ~60fps, 8 seconds = ~480 frames, 15 seconds = ~900 frames
                const framesSinceLastBox = frameCount - lastBoxSpawnTime;
                const minFrames = 480; // 8 seconds at 60fps
                const maxFrames = 900; // 15 seconds at 60fps
                const spawnInterval = minFrames + Math.random() * (maxFrames - minFrames);
                
                if (framesSinceLastBox >= spawnInterval || lastBoxSpawnTime === 0) {
                    createFallingBox();
                    lastBoxSpawnTime = frameCount;
                }
                
                // Update and draw falling boxes
                fallingBoxes = fallingBoxes.filter(box => {
                    // Update position
                    box.y += box.fallSpeed;
                    box.rotation += box.rotationSpeed;
                    
                    // Remove if off screen
                    if (box.y > canvas.height + 100) {
                        return false;
                    }
                    
                    // Draw box
                    ctx.save();
                    ctx.globalAlpha = box.opacity;
                    ctx.translate(box.x, box.y);
                    ctx.rotate(box.rotation);
                    ctx.drawImage(
                        boxImage,
                        -box.size / 2,
                        -box.size / 2,
                        box.size,
                        box.size
                    );
                    ctx.restore();
                    
                    return true;
                });
            }
            
            // Draw connecting lines between nearby particles
            // Note: 'leaves' mode is disabled (Thanksgiving event is over)
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
