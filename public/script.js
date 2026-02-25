document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Effects for Navbar & Reveal Animations
    const navbar = document.getElementById('navbar');
    const reveals = document.querySelectorAll('.reveal');

    const handleScroll = () => {
        if (!navbar) return;
        
        // Navbar background on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Reveal elements on scroll
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger once on load

    // 2. Countdown Timer
    const concertDate = new Date();
    concertDate.setDate(concertDate.getDate() + 30);
    concertDate.setHours(21, 0, 0, 0); // 9 PM

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = concertDate.getTime() - now;

        if (distance < 0) {
            if (daysEl) daysEl.innerText = "00";
            if (hoursEl) hoursEl.innerText = "00";
            if (minutesEl) minutesEl.innerText = "00";
            if (secondsEl) secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, '0');
    };

    // Only run interval if elements exist
    if (daysEl) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // 3. Simple Particle Generation for Hero Section
    const particlesContainer = document.getElementById('particles');
    const generateParticles = () => {
        if (!particlesContainer) return;

        const particleCount = 30; // Embers
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');

            // Random properties
            const size = Math.random() * 4 + 1; // 1px to 5px
            const left = Math.random() * 100; // 0% to 100%
            const duration = Math.random() * 10 + 5; // 5s to 15s
            const delay = Math.random() * 5; // 0s to 5s

            // Styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = Math.random() > 0.5 ? 'var(--color-blood-red)' : 'var(--color-mythic-gold)';
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;
            particle.style.left = `${left}%`;
            particle.style.bottom = '-10px';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            particle.style.pointerEvents = 'none';

            // Animation via JS for floating up
            particle.animate([
                { transform: 'translateY(0) scale(1)', opacity: 0 },
                { opacity: particle.style.opacity, offset: 0.1 },
                { transform: `translateY(-${100 + Math.random() * 100}vh) scale(${Math.random() * 0.5 + 0.5}) translateX(${Math.random() * 100 - 50}px)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                delay: delay * 1000,
                iterations: Infinity,
                easing: 'linear'
            });

            particlesContainer.appendChild(particle);
        }
    };

    generateParticles();

    // 4. Parallax Background Scroll Effect
    const handleParallax = () => {
        const scrolled = window.scrollY;
        document.body.style.backgroundPositionY = `${scrolled * 0.5}px`;
    };

    window.addEventListener('scroll', handleParallax);
    handleParallax(); // Initial call


    // ============================================================
    // 5. AUTHENTICATION / PROFILE WIDGET (NEW ADDITIONS)
    // ============================================================
    const userState = localStorage.getItem('user');
    const hasAccount = localStorage.getItem('hasAccount');

    if (userState) {
        // SCENARIO 1: User is completely logged in.
        const user = JSON.parse(userState);
        const initial = user.name.charAt(0).toUpperCase();
        // Only grant God Mode Link to Akshat's Registration ID
        const isAdmin = user.reg_no === '235805126';
        const adminLinkHTML = isAdmin 
            ? `<a href="admin.html" class="dropdown-link" style="color:var(--color-blood-red); display:block; margin-bottom:15px; font-weight:bold; text-shadow:0 0 10px var(--color-blood-glow);">✦ OMNISCIENCE (Admin)</a>` 
            : ``;

        // 5a. Replace the Top-Right "Summon Your Pass" Nav button with the Profile Circle
        const oldNavCta = document.querySelector('.nav-cta');
        if (oldNavCta) {
            const profileHtml = `
                <div class="user-profile relative-z" id="nav-profile-container">
                    <div class="profile-circle" id="profile-toggle" title="${user.name}">${initial}</div>
                    <div class="profile-dropdown hidden" id="profile-dropdown">
                        <p class="dropdown-greeting">A W A K E N E D</p>
                        <p class="dropdown-name" style="margin-bottom:15px;">${user.name.split(' ')[0]}</p>
                        ${adminLinkHTML}
                        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin-bottom:1rem;">
                        <button id="logout-btn" class="dropdown-link" style="background:transparent;border:none;width:100%;">Sever Link</button>
                    </div>
                </div>
            `;
            oldNavCta.outerHTML = profileHtml;

            // Link Dropdown Events 
            const toggle = document.getElementById('profile-toggle');
            const drop = document.getElementById('profile-dropdown');
            const logoutBtn = document.getElementById('logout-btn');

            if (toggle && drop && logoutBtn) {
                // Clicking avatar opens menu
                toggle.addEventListener('click', (e) => { 
                    e.stopPropagation();
                    drop.classList.toggle('hidden'); 
                });

                // Clicking anywhere else on page closes the menu smoothly
                document.addEventListener('click', (e) => {
                    if (!toggle.contains(e.target) && !drop.contains(e.target)) {
                        drop.classList.add('hidden');
                    }
                });

                // Trigger Logout Session
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user');     // Delete user memory
                    window.location.reload();            // Reload page back to normal status
                });
            }
        }

        // 5b. Update Hero Button indicating domain entry granted
        const heroPrimary = document.querySelector('.hero-actions .btn-primary');
        if (heroPrimary) {
            heroPrimary.textContent = "Access Granted";
            heroPrimary.href = "#lore";
            heroPrimary.style.borderColor = "var(--color-mythic-gold)";
            heroPrimary.style.boxShadow = "var(--shadow-glow-gold)";
            heroPrimary.style.color = "var(--color-mythic-gold)";
        }

        // 5c. Prevent authenticated users from going back into ticket checkout again directly
        const ticketBtns = document.querySelectorAll('.ticket-card .ticket-btn');
        ticketBtns.forEach(btn => {
            btn.textContent = "Summoned";
            btn.href = "javascript:void(0)"; 
            // In a future step, this void(0) could launch the Payment Dashboard Instead!
        });

    } else if (hasAccount === 'true') {
        // SCENARIO 2: Logged out, but system remembers they have an account 
        // Redirect standard registration buttons towards login!
        const navBtn = document.querySelector('.nav-cta');
        if (navBtn) {
            navBtn.textContent = 'Log In';
            navBtn.href = 'login.html';
        }

        const heroBtn = document.querySelector('.hero-actions .btn-primary');
        if (heroBtn) {
            heroBtn.textContent = 'Return to Lore';
            heroBtn.href = 'login.html';
        }
    }

});