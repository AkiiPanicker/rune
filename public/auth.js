document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('su-msg');
            msgObj.style.color = "var(--color-blood-red)";

            const nameStr = document.getElementById('su-name').value;
            const regStr = document.getElementById('su-reg').value;
            const emailStr = document.getElementById('su-email').value;
            const phoneStr = document.getElementById('su-phone').value;

            if (!/^\d{9}$/.test(regStr)) { 
                msgObj.textContent = "Registration Number must be exactly 9 digits."; return; 
            }
            if (!/^\d{10}$/.test(phoneStr)) { 
                msgObj.textContent = "Earthly Phone must be exactly 10 digits."; return; 
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*learner\.manipal\.edu$/.test(emailStr)) {
                msgObj.textContent = "Only sacred @learner.manipal.edu scrolls are permitted."; return; 
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
                    
                    // SAVE USER TO LOCAL BROWSER SESSION & REMEMBER THEY HAVE AN ACCOUNT
                    localStorage.setItem('user', JSON.stringify({ name: result.user.name, reg_no: result.user.reg_no }));
                    localStorage.setItem('hasAccount', 'true');

                    setTimeout(() => window.location.href = 'index.html', 1500); 
                } else {
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Summoning Server Blocked.";
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('lg-msg');
            msgObj.style.color = "var(--color-text-main)";
            msgObj.textContent = "Consulting The Fates...";

            const emailStr = document.getElementById('lg-email').value;
            const regStr = document.getElementById('lg-reg').value;

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
                    
                    localStorage.setItem('user', JSON.stringify({ name: result.user.name, reg_no: result.user.reg_no }));
                    localStorage.setItem('hasAccount', 'true'); // They are an existing member

                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Prophecy failed to fetch.";
            }
        });
    }
});