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

  /* ── Hero Video Switcher ───────────────────────────── */
  const videoElement = document.getElementById('hero-video');
  const videoBtns = document.querySelectorAll('.video-btn');

  if (videoElement && videoBtns.length > 0) {
    videoBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const videoSrc = btn.dataset.video;
        
        // Update video source
        videoElement.src = videoSrc;
        videoElement.play();
        
        // Update active button
        videoBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
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
    'Swashducklers': 'Portfolio/SwashDucklers (1).png',
    'Run Alcibiades Run!': 'Portfolio/20 - 2025-02-24 19-24-27.mp4',
    'Space Man With A Space Plan': 'Portfolio/SpaceMan (1).png',
    'Dungeon Man With A Dungeon Plan': 'Portfolio/DungeonMan (1).PNG',
    'Viva la antichriste corse': 'Portfolio/VivaLaAntichristcorse (1).png'
  };

  // Map engine names to image paths
  const engineImages = {
    '> druid_engine/': 'Portfolio/Druid 1 (1).png',
    '> division_engine/': 'Portfolio/Division (1).png'
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
        previewImg.onerror = function() {
          console.warn('Failed to load preview image:', imagePath);
        };
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
        previewImg.onerror = function() {
          console.warn('Failed to load preview image:', imagePath);
        };
      }
    }
  });

  /* ── Showcase Modal System ─────────────────────────── */
  const portfolioData = {
    druid: {
      name: 'DRUID ENGINE',
      desc: 'High-performance C core engine with C++ editor. Uses OpenGL rendering with a data-oriented architecture designed for extreme performance. Features include mesh rendering, physics systems, and real-time debugging capabilities.',
      tags: ['C/C++', 'OpenGL', 'Data-Oriented', 'High-Performance'],
      assets: [
        'Portfolio/Druid 1 (1).png',
        'Portfolio/Druid 1 (2).png',
        'Portfolio/Druid 1 (3).png',
        'Portfolio/Druid 1 (4).png',
        'Portfolio/Druid 1 (5).png',
        'Portfolio/Druid 2 (1).png',
        'Portfolio/Druid 2 (2).png',
        'Portfolio/Druid Engine examples (1).mp4',
        'Portfolio/Druid Engine examples (2).mp4',
        'Portfolio/Druid Engine examples (3).mp4',
        'Portfolio/Druid.mp4',
        'Portfolio/DruidManyAsteroids.mp4',
        'Portfolio/DruidEngineManyZombies.mp4'
      ]
    },
    division: {
      name: 'DIVISION ENGINE',
      desc: 'First C++ graphics engine built from scratch. Features a custom graphics API that draws directly to bitmap and interfaces with the Windows module. Foundation project for mastering graphics programming and low-level rendering.',
      tags: ['C++', 'Custom API', 'Windows', 'Graphics'],
      assets: [
        'Portfolio/Division (1).png',
        'Portfolio/Division (2).png'
      ]
    },
    swashducklers: {
      name: 'SWASHDUCKLERS',
      desc: 'Swashbuckling action game set on the high seas. Features melee combat, ship mechanics, and ocean exploration with a pirate theme.',
      tags: ['Action', 'Adventure', 'Completed'],
      assets: [
        'Portfolio/SwashDucklers (1).png',
        'Portfolio/SwashDucklers (2).png',
        'Portfolio/SwashDucklers (3).png',
        'Portfolio/SwashDucklers (4).png',
        'Portfolio/SwashDucklers (5).png',
        'Portfolio/SwashDucklers (6).png',
        'Portfolio/SwashDucklers (7).png',
        'Portfolio/SwashDucklers (8).png',
        'Portfolio/SwashDucklers (9).png',
        'Portfolio/SwashDucklers (10).png',
        'Portfolio/SwashDucklers (11).png'
      ]
    },
    alcibiades: {
      name: 'RUN ALCIBIADES RUN!',
      desc: 'Endless runner game set in ancient Greece. Features procedural level generation, power-ups, and ancient Greek mythology-inspired obstacles.',
      tags: ['Endless Runner', 'Ancient Greece', 'Arcade'],
      assets: [
        'Portfolio/20 - 2025-02-24 19-24-27.mp4'
      ]
    },
    spaceman: {
      name: 'SPACE MAN WITH A SPACE PLAN',
      desc: 'Interstellar exploration and strategy game. Navigate space, discover alien worlds, and manage resources. Features complex gameplay mechanics and strategic decision-making.',
      tags: ['Strategy', 'Exploration', 'Space'],
      assets: [
        'Portfolio/SpaceMan (1).png',
        'Portfolio/SpaceMan (2).png'
      ]
    },
    dungeonman: {
      name: 'DUNGEON MAN WITH A DUNGEON PLAN',
      desc: 'Procedurally generated dungeon crawler. Features randomized level generation, classic RPG mechanics, and challenging combat encounters.',
      tags: ['Dungeon Crawler', 'Procedural', 'RPG'],
      assets: [
        'Portfolio/DungeonMan (1).PNG',
        'Portfolio/DungeonMan (2).PNG',
        'Portfolio/DungeonMan (3).PNG',
        'Portfolio/DungeonMan (4).PNG'
      ]
    },
    viva: {
      name: 'VIVA LA ANTICHRISTE CORSE',
      desc: 'Revolutionary chaos unleashed. A stylized action game with unique art direction and intense gameplay. Features fast-paced action sequences and creative level design.',
      tags: ['Action', 'Stylized', 'Chaos'],
      assets: [
        'Portfolio/VivaLaAntichristcorse (1).png',
        'Portfolio/VivaLaAntichristcorse (2).png',
        'Portfolio/VivaLaAntichristcorse (3).png',
        'Portfolio/VivaLaAntichristcorse (1).mp4',
        'Portfolio/DeusProto.PNG'
      ]
    }
  };

  let currentShowcase = null;
  let currentGalleryIndex = 0;

  const modal = document.getElementById('showcase-modal');
  const modalTitle = document.getElementById('modal-project-name');
  const modalTags = document.getElementById('modal-tags');
  const modalDesc = document.getElementById('modal-description');
  const galleryContainer = document.getElementById('gallery-container');
  const galleryCounter = document.getElementById('gallery-counter');
  const modalClose = document.querySelector('.modal-close');
  const galleryPrev = document.querySelector('.gallery-prev');
  const galleryNext = document.querySelector('.gallery-next');

  function createGalleryItem(assetPath) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    if (assetPath.toLowerCase().endsWith('.mp4')) {
      const video = document.createElement('video');
      video.src = assetPath;
      video.controls = true;
      video.autoplay = false;
      video.style.maxWidth = '100%';
      video.style.maxHeight = '100%';
      item.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = assetPath;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      item.appendChild(img);
    }
    
    return item;
  }

  function openShowcase(projectKey) {
    const project = portfolioData[projectKey];
    if (!project) return;

    currentShowcase = projectKey;
    currentGalleryIndex = 0;

    // Update header
    modalTitle.textContent = project.name;

    // Update tags
    modalTags.innerHTML = project.tags
      .map(tag => `<span>${tag}</span>`)
      .join('');

    // Update description
    modalDesc.textContent = project.desc;

    // Build gallery
    galleryContainer.innerHTML = '';
    project.assets.forEach((asset) => {
      galleryContainer.appendChild(createGalleryItem(asset));
    });

    updateGallery();
    modal.classList.add('active');
  }

  function updateGallery() {
    const project = portfolioData[currentShowcase];
    if (!project) return;

    const items = galleryContainer.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === currentGalleryIndex);
    });

    galleryCounter.textContent = `${currentGalleryIndex + 1} / ${items.length}`;
  }

  function closeShowcase() {
    modal.classList.remove('active');
    currentShowcase = null;
  }

  // Event listeners
  modalClose.addEventListener('click', closeShowcase);
  modal.querySelector('.modal-overlay').addEventListener('click', closeShowcase);

  galleryPrev.addEventListener('click', () => {
    const project = portfolioData[currentShowcase];
    if (!project) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + project.assets.length) % project.assets.length;
    updateGallery();
  });

  galleryNext.addEventListener('click', () => {
    const project = portfolioData[currentShowcase];
    if (!project) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % project.assets.length;
    updateGallery();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeShowcase();
    if (e.key === 'ArrowLeft') galleryPrev.click();
    if (e.key === 'ArrowRight') galleryNext.click();
  });

  // Attach click handlers to project cards
  document.querySelectorAll('[data-project]').forEach((element) => {
    element.style.cursor = 'pointer';
    element.addEventListener('click', (e) => {
      // Don't open if clicking on a link
      if (e.target.closest('a')) return;
      const projectKey = element.dataset.project;
      openShowcase(projectKey);
    });
  });
})();
