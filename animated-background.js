// Interactive Background System
(function() {
    let canvas, ctx;
    let cursorParticles = []; // Particles that follow cursor
    let floatingParticles = []; // Particles that float independently
    let ripples = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    
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
                y: Math.random() * canvas.height,
                targetX: 0,
                targetY: 0,
                radius: Math.random() * 2.5 + 1.5,
                ease: Math.random() * 0.015 + 0.005, // Much slower - 0.005 to 0.02
                hue: Math.random() * 360,
                offsetX: offsetX, // Offset from cursor
                offsetY: offsetY,
                driftSpeed: (Math.random() - 0.5) * 0.02, // Slow drift
                driftAngle: Math.random() * Math.PI * 2,
                vx: 0, // Velocity for smoother physics
                vy: 0
            });
        }
        
        // Create independent floating particles
        const numFloatingParticles = 50;
        for (let i = 0; i < numFloatingParticles; i++) {
            floatingParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2.5 + 1,
                hue: Math.random() * 360,
                speed: Math.random() * 0.3 + 0.1
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
        
        // Animate
        function animate() {
            time += 0.01;
            
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
            floatingParticles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Add some drift
                particle.vx += (Math.random() - 0.5) * 0.01;
                particle.vy += (Math.random() - 0.5) * 0.01;
                
                // Limit velocity
                const maxVel = 1;
                particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
                particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
                
                // Update hue slowly
                particle.hue = (particle.hue + particle.speed) % 360;
                
                // Draw floating particle
                const alpha = 0.3 + Math.sin(time + particle.x * 0.01) * 0.2;
                ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
                ctx.shadowColor = `hsla(${particle.hue}, 70%, 60%, 0.6)`;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // Update and draw cursor-following particles
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
                
                // Draw particle with enhanced glow
                ctx.fillStyle = `hsla(${particle.hue}, 75%, 65%, ${alpha})`;
                ctx.shadowColor = `hsla(${particle.hue}, 75%, 65%, ${alpha * 1.5})`;
                ctx.shadowBlur = 10 + Math.sin(time + i) * 2;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // Draw connecting lines between nearby particles (both types)
            const allParticles = [...cursorParticles, ...floatingParticles];
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
