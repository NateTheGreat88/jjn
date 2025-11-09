// Animated Background System
(function() {
    // Create animated background canvas
    function createAnimatedBackground() {
        // Check if canvas already exists
        if (document.getElementById('animatedBackground')) {
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.id = 'animatedBackground';
        canvas.className = 'animated-background-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        
        // Make body background transparent
        document.body.style.background = 'transparent';
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Animation variables
        let time = 0;
        const particles = [];
        const numParticles = 50;
        
        // Create particles
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                hue: Math.random() * 360
            });
        }
        
        // Gradient colors that shift over time
        const gradientColors = [
            { r: 26, g: 26, b: 46 },   // #1a1a2e
            { r: 22, g: 33, b: 62 },   // #16213e
            { r: 15, g: 52, b: 96 },   // #0f3460
            { r: 74, g: 158, b: 255 }, // #4a9eff
            { r: 255, g: 107, b: 107 } // #ff6b6b
        ];
        
        // Animate
        function animate() {
            time += 0.01;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Create animated gradient background
            const gradient = ctx.createLinearGradient(
                0, 0, 
                canvas.width, 
                canvas.height
            );
            
            // Animate gradient colors
            const colorShift = Math.sin(time) * 0.3 + 0.7;
            const hueShift = (time * 10) % 360;
            
            gradient.addColorStop(0, `rgba(${26 + Math.sin(time) * 20}, ${26 + Math.cos(time * 0.7) * 20}, ${46 + Math.sin(time * 1.3) * 20}, 0.95)`);
            gradient.addColorStop(0.3, `rgba(${22 + Math.sin(time * 1.2) * 15}, ${33 + Math.cos(time * 0.9) * 15}, ${62 + Math.sin(time * 1.1) * 15}, 0.95)`);
            gradient.addColorStop(0.6, `rgba(${15 + Math.sin(time * 0.8) * 25}, ${52 + Math.cos(time * 1.1) * 25}, ${96 + Math.sin(time * 0.9) * 25}, 0.95)`);
            gradient.addColorStop(1, `rgba(${74 + Math.sin(time * 1.3) * 30}, ${158 + Math.cos(time * 0.7) * 30}, ${255 + Math.sin(time * 1.2) * 30}, 0.95)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add radial gradient overlays for depth
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
            
            // Animate particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Update hue
                particle.hue = (particle.hue + 0.5) % 360;
                
                // Draw particle
                const alpha = 0.3 + Math.sin(time + particle.x * 0.01) * 0.2;
                ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Add connecting lines between nearby particles
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        const alpha = (1 - distance / 150) * 0.2;
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
        document.addEventListener('DOMContentLoaded', createAnimatedBackground);
    } else {
        createAnimatedBackground();
    }
    
    // Re-initialize on page transitions
    window.addEventListener('pageshow', () => {
        if (!document.getElementById('animatedBackground')) {
            setTimeout(createAnimatedBackground, 100);
        }
    });
})();

