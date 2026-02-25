document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Effects for Navbar & Reveal Animations
    const navbar = document.getElementById('navbar');
    const reveals = document.querySelectorAll('.reveal');

    const handleScroll = () => {
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
    // Set concert date to roughly 30 days from now for demo purposes
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
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minutesEl.innerText = "00";
            secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days.toString().padStart(2, '0');
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minutesEl.innerText = minutes.toString().padStart(2, '0');
        secondsEl.innerText = seconds.toString().padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 3. Simple Particle Generation for Hero Section
    const particlesContainer = document.getElementById('particles');
    const generateParticles = () => {
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
    // The background should scroll slower than the content, moving upwards
    const handleParallax = () => {
        const scrolled = window.scrollY;
        // The image naturally scrolls up 1px per 1px scrolled.
        // We push it down slightly to make it *seem* like it's scrolling up slower.
        // For example, if we scroll 100px down, image moves 100px up natively.
        // We offset it by +50px, so it only moved 50px up relative to the screen.
        document.body.style.backgroundPositionY = `${scrolled * 0.5}px`;
    };

    window.addEventListener('scroll', handleParallax);
    handleParallax(); // Initial call
});