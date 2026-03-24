(function () {
  "use strict";

  /* ── Data Stream Ribbon Animation ──────────────────── */
  const canvas = document.getElementById('data-stream-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Set canvas size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Character sets for data stream
    const hexChars = '0123456789ABCDEF';
    
    // Helper function to generate random hex value
    function generateHexValue() {
      const length = Math.random() > 0.6 ? 2 : Math.random() > 0.5 ? 4 : 3;
      let hex = '0x';
      for (let i = 0; i < length; i++) {
        hex += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      return hex;
    }
    
    // Helper function to generate random binary string
    function generateBinaryValue() {
      // 85% chance of single digit, 15% chance of longer string
      if (Math.random() > 0.15) {
        return Math.random() > 0.5 ? '1' : '0';
      }
      // Generate longer but random binary string to avoid patterns
      const length = Math.random() > 0.6 ? 3 : Math.random() > 0.5 ? 4 : 5;
      let binary = '';
      for (let i = 0; i < length; i++) {
        binary += Math.random() > 0.5 ? '1' : '0';
      }
      return binary;
    }
    
    // Create data particle
    class DataParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * 1.5 + 0.5; // Slight downward bias
        this.char = Math.random() > 0.6 
          ? generateHexValue()
          : generateBinaryValue();
        this.size = Math.random() * 3 + 9;
        this.age = 0;
        this.lifetime = Math.random() * 400 + 300;
        this.opacity = 0;
      }
      
      update() {
        // Move toward mouse with some randomness
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 350) {
          this.vx += (dx / distance) * 0.15;
          this.vy += (dy / distance) * 0.15;
        }
        
        // Add some drift
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;
        
        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
        
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        
        // Wrap around screen
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
        
        // Fade in and out
        if (this.age < 50) {
          this.opacity = this.age / 50;
        } else {
          this.opacity = Math.max(0, 1 - ((this.age - 50) / (this.lifetime - 50)));
        }
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.8;
        
        // Interpolate green color based on opacity
        const greenValue = Math.floor(255 * this.opacity);
        ctx.fillStyle = `rgb(0, ${greenValue}, 65)`;
        
        ctx.font = `bold ${this.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add glow effect
        ctx.shadowColor = `rgba(0, 255, 65, ${this.opacity * 0.6})`;
        ctx.shadowBlur = 8;
        
        ctx.fillText(this.char, this.x, this.y);
        
        ctx.restore();
      }
      
      isDead() {
        return this.age >= this.lifetime;
      }
    }
    
    // Particle pool
    let particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push(new DataParticle());
    }
    
    // CRT wipe state
    let crtWipeActive = false;
    let crtWipeProgress = 0;
    let lastWipeTime = Date.now();
    
    // Animation loop
    function animate() {
      const currentTime = Date.now();
      
      // Trigger CRT wipe every 15 seconds
      if (currentTime - lastWipeTime > 15000) {
        crtWipeActive = true;
        crtWipeProgress = 0;
        lastWipeTime = currentTime;
      }
      
      // CRT wipe effect
      if (crtWipeActive) {
        crtWipeProgress += 0.03;
        
        if (crtWipeProgress >= 1) {
          crtWipeActive = false;
          // Clear and respawn all particles
          particles = [];
          for (let i = 0; i < 40; i++) {
            particles.push(new DataParticle());
          }
        } else {
          // Scan line wipe from top
          const wipeY = canvas.height * crtWipeProgress;
          
          // Clear above wipe line
          ctx.fillStyle = 'rgba(10, 10, 10, 1)';
          ctx.fillRect(0, 0, canvas.width, wipeY);
          
          // Add scan line effect
          ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, wipeY);
          ctx.lineTo(canvas.width, wipeY);
          ctx.stroke();
        }
      } else {
        // Normal fade - allows trails to persist and build
        ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].isDead()) {
          particles.splice(i, 1);
          particles.push(new DataParticle());
        }
      }
      
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ── Dynamic boot messages ──────────────────────────── */
  const bootMessages = {
    engines: '[BOOT] Loading engines module.............. <span class="prompt">OK</span>',
    games: '[BOOT] Loading games archive................ <span class="prompt">OK</span>',
    education: '[BOOT] Loading education records........... <span class="prompt">OK</span>'
  };

  /* ── Scroll reveal ──────────────────────────────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          
          // Add boot message if section has data-section attribute
          const sectionName = e.target.getAttribute('data-section');
          if (sectionName && bootMessages[sectionName]) {
            const bootLine = document.getElementById(`boot-${sectionName}`);
            if (bootLine) {
              bootLine.innerHTML = bootMessages[sectionName];
              bootLine.classList.add('muted');
            }
          }
          
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ── Game & Engine hover preview loading ──────────────────────────────────── */
  // Map game names to image paths
  const gameImages = {
    'Swashducklers': 'img/swashducklers.jpg',
    'Run Alcibiades Run!': 'img/run-alcibiades.jpg',
    'Space Man With A Space Plan': 'img/spaceman.jpg',
    'Dungeon Man With A Dungeon Plan': 'img/dungeonman.jpg',
    'Viva la antichriste corse': 'img/viva.jpg'
  };

  // Map engine names to image paths
  const engineImages = {
    'druid_engine/': 'img/druid-engine.jpg',
    'division_engine/': 'img/division-engine.jpg'
  };

  // Handle game hover preview loading
  document.querySelectorAll('.game-row').forEach((gameRow) => {
    const nameEl = gameRow.querySelector('.col-name');
    const previewImg = gameRow.querySelector('.game-preview img');
    
    if (nameEl && previewImg) {
      const gameName = nameEl.textContent.trim();
      const imagePath = gameImages[gameName];
      
      if (imagePath) {
        previewImg.src = imagePath;
        previewImg.alt = gameName;
      }
    }
  });

  // Handle engine hover preview loading
  document.querySelectorAll('.engine-card').forEach((card) => {
    const nameEl = card.querySelector('.entry-name');
    const previewImg = card.querySelector('.engine-preview img');
    
    if (nameEl && previewImg) {
      const engineName = nameEl.textContent.trim();
      const imagePath = engineImages[engineName];
      
      if (imagePath) {
        previewImg.src = imagePath;
        previewImg.alt = engineName;
      }
    }
  });
})();
