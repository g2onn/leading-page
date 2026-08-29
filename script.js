// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Global Variables
let particlesActive = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Custom Cursor (Immediate, no wait for load)
    initCustomCursor();
    
    // 2. Setup Navbar & Scroll
    initNavbar();
    initScrollProgress();
    initSmoothScroll();
    
    // 3. Initialize Interactive Elements
    initMagneticButtons();
    initTiltCards();
    
    // 4. Initialize Three.js (can start setting up early)
    initThreeJS();
});

window.addEventListener('load', () => {
    // Wait for everything to load, then run preloader
    runPreloader();
});

// --- Preloader & Hero ---

function runPreloader() {
    const preloader = document.querySelector('.preloader');
    const bar = document.querySelector('.preloader-bar');
    
    if (bar && preloader) {
        gsap.to(bar, {
            width: '100%',
            duration: 1.1,
            ease: 'power3.inOut',
            onComplete: () => {
                preloader.classList.add('loaded');
                initHeroAnimations();
            }
        });
    } else {
        // Fallback if no preloader
        initHeroAnimations();
    }
}

function initHeroAnimations() {
    const tl = gsap.timeline();
    
    tl.from('.hero-label span', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    })
    .from('.char', {
        y: '120%',
        opacity: 0,
        stagger: 0.03,
        duration: 0.6,
        ease: 'power4.out'
    }, "-=0.4")
    .from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: runTextScramble
    }, "-=0.2")
    .from('.hero-actions', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, "-=0.6")
    .from('.hero-scroll', {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, "-=0.4");
    
    // Parallax hero on scroll
    gsap.to('.hero-content', {
        y: 150,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // The parallax above pushes .hero-content (and its buttons) downward as
    // you scroll, while .hero-scroll stays put - so it fades out quickly at
    // the very start of the scroll instead of sitting there to be run into.
    gsap.to('.hero-scroll', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: '+=150',
            scrub: true
        }
    });

    // Safety net: if the entrance timeline ever gets interrupted or stalls
    // (tab throttling, a slow first paint, etc.), fade the hero copy back to
    // its normal visible state so it never gets stuck hidden. We kill the
    // whole timeline first (not just individual tweens) so that if the ticker
    // later recovers, GSAP can't resume rendering the old stuck state and
    // stomp back over this fallback. A plain CSS transition keeps the
    // fallback from popping in abruptly.
    setTimeout(() => {
        tl.kill();
        document.querySelectorAll('.hero-label span, .char, .hero-subtitle, .hero-actions, .hero-scroll').forEach(el => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }, 1500);

    initScrollAnimations();
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
}

function runTextScramble() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;
    
    const chars = '!<>-_\\/[]{}—=+*^?#________'.split('');
    const originalText = subtitle.innerText;
    let iterations = 0;
    
    const durationMs = 1100;
    const intervalMs = 22;
    const totalSteps = durationMs / intervalMs;
    const stepAmount = originalText.length / totalSteps;
    
    const interval = setInterval(() => {
        subtitle.innerText = originalText
            .split('')
            .map((letter, index) => {
                if (index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
            
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += stepAmount;
    }, intervalMs);
}

// --- Custom Cursor ---

function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return; // Touch devices
    
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower) return;
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });
    
    function renderFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        requestAnimationFrame(renderFollower);
    }
    renderFollower();
    
    const interactives = document.querySelectorAll('a, button, .magnetic-btn, .service-card, [data-tilt]');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });
}

// --- Scroll & Navbar ---

function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const percent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = percent + '%';
    });
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            if (window.scrollY > lastScrollY && window.scrollY > 300) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });
    }
    
    const hamburger = document.querySelector('.nav-hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                
                const navMenu = document.querySelector('.nav-menu');
                const hamburger = document.querySelector('.nav-hamburger');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                }
            }
        });
    });
}

// --- Interactive Elements ---

function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const xVal = (x / rect.width) * 30;
            const yVal = (y / rect.height) * 30;
            
            gsap.to(btn, {
                x: xVal,
                y: yVal,
                duration: 0.3,
                ease: 'power3.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top; 
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: 'power3.out'
            });
            
            if (glow) {
                glow.style.opacity = '1';
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: 'power3.out'
            });
            
            if (glow) glow.style.opacity = '0';
        });
    });
}

// --- Scroll Animations (GSAP) ---

function initScrollAnimations() {
    // About Section
    gsap.from('#about .section-tag, #about .section-title', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });
    
    // Services Section Header
    gsap.from('#services .section-tag, #services .section-title', {
        scrollTrigger: {
            trigger: '#services',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });
    
    // Process Section Header
    gsap.from('#process .section-tag, #process .section-title', {
        scrollTrigger: {
            trigger: '#process',
            start: 'top 80%'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });
    
    gsap.from('.about-description p', {
        scrollTrigger: {
            trigger: '.about-description',
            start: 'top 85%'
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });
    
    gsap.from('.stat-item', {
        scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 85%'
        },
        opacity: 0,
        stagger: 0.2,
        duration: 0.8
    });

    // Count up immediately as the stats scroll into view, in parallel with the
    // fade-in above (instead of waiting for that staggered reveal to finish first)
    ScrollTrigger.create({
        trigger: '.about-stats',
        start: 'top 85%',
        once: true,
        onEnter: startCounters
    });
    // Features Section
    gsap.from('.feature-card', {
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%'
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });
    

    // Technology Section
    gsap.from('.tech-card', {
        scrollTrigger: {
            trigger: '.tech-grid',
            start: 'top 80%'
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });
    
    // Process Section
    const processSteps = gsap.utils.toArray('.process-step');
    processSteps.forEach((step, i) => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 60%',
            toggleClass: 'active',
            once: false
        });
    });

    // --- SHOWCASE: simple crossfade carousel ---
    // No scroll-jacking, no pin: the section just sits in the page like any
    // other. It advances on its own every 10s, and can be driven directly
    // with the prev/next buttons or the dots.
    initShowcaseCarousel();

    function initShowcaseCarousel() {
        const pages = gsap.utils.toArray('.showcase-page');
        if (!pages.length) return;

        const dots = gsap.utils.toArray('.showcase-nav .nav-dot');
        const prevBtn = document.querySelector('.showcase-prev');
        const nextBtn = document.querySelector('.showcase-next');
        const AUTOPLAY_MS = 10000;

        // Prep each icon's SVG strokes so they can "draw on" as their card
        // becomes active, and undraw as it leaves
        const shapesByPage = pages.map(p => gsap.utils.toArray(
            p.querySelectorAll('.showcase-graphic svg path, .showcase-graphic svg rect, .showcase-graphic svg line')
        ));
        shapesByPage.forEach(shapes => shapes.forEach(shape => {
            const len = shape.getTotalLength();
            shape.style.strokeDasharray = len;
            shape.style.strokeDashoffset = len;
        }));

        gsap.set(pages, { opacity: 0, zIndex: 1 });
        gsap.set(pages[0], { opacity: 1, zIndex: 2 });
        gsap.set(shapesByPage[0], { strokeDashoffset: 0 });

        let activeIndex = 0;
        let autoplayTimer = null;

        function goTo(index) {
            const nextIndex = ((index % pages.length) + pages.length) % pages.length;
            if (nextIndex === activeIndex) return;

            const outgoing = pages[activeIndex];
            const incoming = pages[nextIndex];

            gsap.to(outgoing, { opacity: 0, zIndex: 1, duration: 0.7, ease: 'power2.inOut', overwrite: 'auto' });
            gsap.to(shapesByPage[activeIndex], { strokeDashoffset: (i, t) => t.style.strokeDasharray, duration: 0.5, ease: 'power1.inOut', overwrite: 'auto' });

            gsap.set(incoming, { zIndex: 2 });
            gsap.to(incoming, { opacity: 1, duration: 0.7, ease: 'power2.inOut', overwrite: 'auto' });
            gsap.to(shapesByPage[nextIndex], { strokeDashoffset: 0, duration: 0.9, delay: 0.15, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' });

            dots.forEach((dot, i) => dot.classList.toggle('active', i === nextIndex));
            activeIndex = nextIndex;
        }

        function restartAutoplay() {
            if (autoplayTimer) clearInterval(autoplayTimer);
            autoplayTimer = setInterval(() => goTo(activeIndex + 1), AUTOPLAY_MS);
        }

        function manualGoTo(index) {
            goTo(index);
            restartAutoplay();
        }

        dots.forEach((dot, i) => dot.addEventListener('click', () => manualGoTo(i)));
        if (prevBtn) prevBtn.addEventListener('click', () => manualGoTo(activeIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => manualGoTo(activeIndex + 1));

        // Only run the autoplay timer while the carousel is actually on screen
        ScrollTrigger.create({
            trigger: '.showcase-wrapper',
            start: 'top 90%',
            end: 'bottom 10%',
            onEnter: restartAutoplay,
            onEnterBack: restartAutoplay,
            onLeave: () => autoplayTimer && clearInterval(autoplayTimer),
            onLeaveBack: () => autoplayTimer && clearInterval(autoplayTimer)
        });
    }
    
    gsap.to('.timeline-progress', {
        scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 60%',
            end: 'bottom 60%',
            scrub: 1.5
        },
        height: '100%',
        ease: 'none'
    });
    
    const steps = document.querySelectorAll('.process-step');
    steps.forEach(step => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            onEnter: () => step.classList.add('active'),
            onEnterBack: () => step.classList.add('active'),
            onLeave: () => step.classList.remove('active'),
            onLeaveBack: () => step.classList.remove('active')
        });
    });
    
    // CTA Section
    gsap.from('.cta-title', {
        scrollTrigger: { trigger: '#contact', start: 'top 80%' },
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
    
    gsap.from('.cta-subtitle', {
        scrollTrigger: { trigger: '#contact', start: 'top 75%' },
        y: 20, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
    
    gsap.from('.cta-button', {
        scrollTrigger: { trigger: '#contact', start: 'top 75%' },
        scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.5)'
    });
    
    // CTA Orbs Parallax
    gsap.to('.orb', {
        y: -50,
        scrollTrigger: {
            trigger: '#contact',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
}

function startCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
        let obj = { val: 0 };
        
        gsap.to(obj, {
            val: target,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
                counter.innerText = Math.ceil(obj.val);
            }
        });
    });
}

// --- Three.js Particle System ---

function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    try {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded. Skipping particle system.');
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Particles setup
        const particleCount = 1500;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 40;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xC8FF00,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Connections setup
        const linesGeometry = new THREE.BufferGeometry();
        const linesMaterial = new THREE.LineBasicMaterial({
            color: 0xC8FF00,
            transparent: true,
            opacity: 0.08
        });
        
        const maxConnections = 200;
        const linePositions = new Float32Array(maxConnections * 6);
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        linesGeometry.setDrawRange(0, 0);
        
        const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(linesMesh);

        // Mouse tracking
        const mouse = new THREE.Vector2(0, 0);
        let targetX = 0;
        let targetY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            targetX = mouse.x * 2;
            targetY = mouse.y * 2;
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            particlesMesh.rotation.x += 0.0003;
            particlesMesh.rotation.y += 0.0003;
            
            particlesMesh.rotation.x += (targetY * 0.1 - particlesMesh.rotation.x) * 0.05;
            particlesMesh.rotation.y += (targetX * 0.1 - particlesMesh.rotation.y) * 0.05;

            let connectionCount = 0;
            const positionsArr = particlesGeometry.attributes.position.array;
            const maxDistSq = 9; 
            
            for (let i = 0; i < particleCount; i++) {
                if (connectionCount >= maxConnections) break;
                for (let j = i + 1; j < Math.min(i + 50, particleCount); j++) {
                    if (connectionCount >= maxConnections) break;
                    
                    const dx = positionsArr[i*3] - positionsArr[j*3];
                    const dy = positionsArr[i*3+1] - positionsArr[j*3+1];
                    const dz = positionsArr[i*3+2] - positionsArr[j*3+2];
                    
                    const distSq = dx*dx + dy*dy + dz*dz;
                    
                    if (distSq < maxDistSq) {
                        linePositions[connectionCount*6] = positionsArr[i*3];
                        linePositions[connectionCount*6+1] = positionsArr[i*3+1];
                        linePositions[connectionCount*6+2] = positionsArr[i*3+2];
                        
                        linePositions[connectionCount*6+3] = positionsArr[j*3];
                        linePositions[connectionCount*6+4] = positionsArr[j*3+1];
                        linePositions[connectionCount*6+5] = positionsArr[j*3+2];
                        
                        connectionCount++;
                    }
                }
            }
            
            linesMesh.rotation.copy(particlesMesh.rotation);
            linesGeometry.attributes.position.needsUpdate = true;
            linesGeometry.setDrawRange(0, connectionCount * 2);

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
    } catch (e) {
        console.error('Error initializing Three.js:', e);
    }
}

// --- Dynamic SVG Shapes for Feature Cards ---
function drawCardShapes() {
    const wrappers = document.querySelectorAll('.feature-card-wrapper');
    wrappers.forEach(wrapper => {
        const card = wrapper.querySelector('.feature-card');
        if (!card) return;
        
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        const r = 24; // border radius
        const tw = 160; // tab width
        const th = 60;  // tab height
        const nw = 60;  // notch width
        const nh = 60;  // notch height
        
        let d = '';
        if (wrapper.classList.contains('type-1') || wrapper.classList.contains('type-3')) {
            d = `M 0,${r} A ${r},${r} 0 0,1 ${r},0 L ${tw-r},0 A ${r},${r} 0 0,1 ${tw},${r} L ${tw},${th-r} A ${r},${r} 0 0,0 ${tw+r},${th} L ${w-r},${th} A ${r},${r} 0 0,1 ${w},${th+r} L ${w},${h-r} A ${r},${r} 0 0,1 ${w-r},${h} L ${nw+r},${h} A ${r},${r} 0 0,1 ${nw},${h-r} L ${nw},${h-nh+r} A ${r},${r} 0 0,0 ${nw-r},${h-nh} L ${r},${h-nh} A ${r},${r} 0 0,1 0,${h-nh-r} Z`;
        } else if (wrapper.classList.contains('type-2')) {
            d = `M 0,${r} A ${r},${r} 0 0,1 ${r},0 L ${tw-r},0 A ${r},${r} 0 0,1 ${tw},${r} L ${tw},${th-r} A ${r},${r} 0 0,0 ${tw+r},${th} L ${w-r},${th} A ${r},${r} 0 0,1 ${w},${th+r} L ${w},${h-nh-r} A ${r},${r} 0 0,1 ${w-r},${h-nh} L ${w-nw+r},${h-nh} A ${r},${r} 0 0,0 ${w-nw},${h-nh+r} L ${w-nw},${h-r} A ${r},${r} 0 0,1 ${w-nw-r},${h} L ${r},${h} A ${r},${r} 0 0,1 0,${h-r} Z`;
        }
        
        const fill = wrapper.classList.contains('type-3') ? '#111' : '#0f0f0f';
        const stroke = 'rgba(255, 255, 255, 0.08)';
        
        let svgBgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="position:absolute; top:0; left:0; z-index:0; pointer-events:none;">
            <path d="${d}" fill="${fill}" stroke="none"/>
        </svg>`;
        
        let svgBorderHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="position:absolute; top:0; left:0; z-index:20; pointer-events:none;">
            <path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
        </svg>`;
        
        const oldBgs = card.querySelectorAll('svg.shape-bg');
        oldBgs.forEach(s => s.remove());
        const oldBorders = card.querySelectorAll('svg.shape-border');
        oldBorders.forEach(s => s.remove());
        
        const tempDivBg = document.createElement('div');
        tempDivBg.innerHTML = svgBgHtml;
        const svgBgEl = tempDivBg.firstChild;
        svgBgEl.classList.add('shape-bg');
        card.prepend(svgBgEl);
        
        const tempDivBorder = document.createElement('div');
        tempDivBorder.innerHTML = svgBorderHtml;
        const svgBorderEl = tempDivBorder.firstChild;
        svgBorderEl.classList.add('shape-border');
        card.appendChild(svgBorderEl);
        
        if (wrapper.classList.contains('type-3')) {
            const imgWrapper = card.querySelector('.feature-image-wrapper');
            if (imgWrapper) {
                // Adjust inner clip-path to perfectly match SVG bounds minus border
                imgWrapper.style.clipPath = `path('${d}')`;
            }
            const overlay = card.querySelector('.feature-title-overlay');
            if (overlay) {
                overlay.style.clipPath = `path('${d}')`;
            }
        }
    });
}

// ResizeObserver reacts to the cards' real rendered size (font swaps,
// orientation change, layout shifts, iOS toolbar show/hide) instead of just
// the window 'resize'/'load' events, which could fire before the layout has
// actually settled and leave the clip-path drawn for a stale width.
let drawCardShapesRaf = null;
function scheduleDrawCardShapes() {
    if (drawCardShapesRaf) cancelAnimationFrame(drawCardShapesRaf);
    drawCardShapesRaf = requestAnimationFrame(drawCardShapes);
}

window.addEventListener('load', scheduleDrawCardShapes);
window.addEventListener('resize', scheduleDrawCardShapes);
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleDrawCardShapes);
}
if ('ResizeObserver' in window) {
    const cardResizeObserver = new ResizeObserver(scheduleDrawCardShapes);
    document.querySelectorAll('.feature-card').forEach(card => cardResizeObserver.observe(card));
}
