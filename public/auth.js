document.addEventListener('DOMContentLoaded', () => {

    // Handlers for Registration Process
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('su-msg');
            msgObj.style.color = "var(--color-blood-red)";

            const nameStr = document.getElementById('su-name').value.trim();
            const regStr = document.getElementById('su-reg').value.trim();
            const emailStr = document.getElementById('su-email').value.trim().toLowerCase();
            const phoneStr = document.getElementById('su-phone').value.trim();

            // Strict Realm Validations
            if (!/^(\d{9}|\d{12})$/.test(regStr)) { 
                msgObj.textContent = "Registration Number must be exactly 9 or 12 digits."; return; 
            }
            if (!/^\d{10}$/.test(phoneStr)) { 
                msgObj.textContent = "Earthly Phone must be exactly 10 digits."; return; 
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*learner\.manipal\.edu$/.test(emailStr)) {
                msgObj.textContent = "Only sacred @learner.manipal.edu mails are permitted."; return; 
            }

            msgObj.textContent = "Commencing Ritual...";
            msgObj.style.color = "var(--color-text-main)";

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: nameStr, reg_no: regStr, email: emailStr, phone: phoneStr })
                });
                
                const result = await response.json();
                msgObj.textContent = result.message;

                if (result.success) {
                    msgObj.style.color = "var(--color-mythic-gold)";
                    
                    // NEW: Update Local Storage parameters to include Rune and Tier Status 
                    localStorage.setItem('user', JSON.stringify({ 
                        name: result.user.name, 
                        reg_no: result.user.reg_no,
                        tier: result.user.tier,     // <-- For the Digital Pass Grimoire
                        rune: result.user.rune      // <-- For the Mythic aesthetic Grimoire
                    }));
                    localStorage.setItem('hasAccount', 'true');

                    // NEW: Go to digital QR ticket page immediately!
                    setTimeout(() => window.location.href = 'dashboard.html', 1500); 
                } else {
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Summoning Server Blocked.";
            }
        });
    }

    // Handlers for returning Mortals/Domain Re-entry
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('lg-msg');
            msgObj.style.color = "var(--color-text-main)";
            msgObj.textContent = "Consulting The Fates...";

            const emailStr = document.getElementById('lg-email').value.trim().toLowerCase();
            const regStr = document.getElementById('lg-reg').value.trim();

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailStr, reg_no: regStr })
                });

                const result = await response.json();
                msgObj.textContent = result.message;

                if (result.success) {
                    msgObj.style.color = "var(--color-mythic-gold)";
                    
                    // SAVE USER SESSION Including Rune parameters
                    localStorage.setItem('user', JSON.stringify({ 
                        name: result.user.name, 
                        reg_no: result.user.reg_no,
                        tier: result.user.tier, 
                        rune: result.user.rune
                    }));
                    localStorage.setItem('hasAccount', 'true'); 

                    // Ensure user bounces to Digital Dashboard NOT index
                    setTimeout(() => window.location.href = 'dashboard.html', 1000);
                } else {
                    // This perfectly handles the newly injected "[Banned] YOU ARE EXILED" Backend prompt visually!!
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Prophecy failed to fetch.";
            }
        });
    }
});