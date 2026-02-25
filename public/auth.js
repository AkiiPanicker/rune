document.addEventListener('DOMContentLoaded', () => {

    // Handlers for Registration Process
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('su-msg');
            msgObj.textContent = "Commencing Ritual...";
            msgObj.style.color = "var(--color-text-main)";

            const data = {
                name: document.getElementById('su-name').value,
                reg_no: document.getElementById('su-reg').value,
                email: document.getElementById('su-email').value,
                phone: document.getElementById('su-phone').value,
            };

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                msgObj.textContent = result.message;

                if (result.success) {
                    msgObj.style.color = "var(--color-mythic-gold)";
                    setTimeout(() => window.location.href = 'index.html', 2000); // Back to Lore Home upon auth completion
                } else {
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Summoning Server Blocked/Failed.";
            }
        });
    }

    // Handlers for returning Mortals/Domain Re-entry
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgObj = document.getElementById('lg-msg');
            msgObj.textContent = "Consulting The Fates...";
            msgObj.style.color = "var(--color-text-main)";

            const data = {
                email: document.getElementById('lg-email').value,
                reg_no: document.getElementById('lg-reg').value
            };

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                msgObj.textContent = result.message;

                if (result.success) {
                    msgObj.style.color = "var(--color-mythic-gold)";
                    // Assuming redirection directly to main app upon successful authentication.
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    msgObj.style.color = "var(--color-blood-red)";
                }
            } catch (err) {
                msgObj.textContent = "Prophecy failed to fetch.";
            }
        });
    }
});