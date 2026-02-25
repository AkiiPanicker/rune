document.addEventListener('DOMContentLoaded', async () => {
    
    // GUARD 1: Check LocalStorage Presence
    const userState = localStorage.getItem('user');
    if (!userState) return window.location.href = 'index.html';

    const user = JSON.parse(userState);

    // GUARD 2: Check Akshat's Registration Key Match
    if (user.reg_no !== '235805126') return window.location.href = 'index.html'; // Banish imposter

    const renderAdminUI = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reg_no: user.reg_no })
            });

            const data = await res.json();
            
            if (data.success) {
                // Update Total Users Glow Box
                document.getElementById('stat-users').innerText = data.totalUsers;
                document.getElementById('stat-users').setAttribute('data-text', data.totalUsers);

                // Render Realm Ledger (Dynamically injecting real Banish rules mapping your UI theme)
                const usrList = document.getElementById('user-admin-list');
                if (usrList) {
                    usrList.innerHTML = '';
                    data.allUsers.forEach(soul => {
                        const li = document.createElement('li');
                        li.className = 'recent-user-item';
                        li.style.display = 'flex'; li.style.justifyContent = 'space-between';
                        li.style.alignItems = 'center';
                        
                        const statusTxt = soul.is_banned ? '<span style="color:var(--color-blood-red)">[ BANISHED ]</span>' : '';
                        
                        // Protect your God Admin ID from getting a ban button
                        const banAction = soul.is_banned || soul.reg_no === '235805126' ? '' : 
                                          `<button onclick="banishUser('${soul.reg_no}')" style="background:transparent; border:1px solid var(--color-blood-red); color:var(--color-blood-red); padding:5px 10px; cursor:pointer; font-family:var(--font-heading-alt);">X Banish</button>`;
                        
                        li.innerHTML = `<div><strong style="font-family:var(--font-heading); color:var(--color-mythic-gold); font-size:1.1rem;">${soul.name}</strong> <span style="font-size:0.8rem; margin-left:15px; color:var(--color-text-muted);">${soul.reg_no} ${statusTxt}</span></div><div>${banAction}</div>`;
                        usrList.appendChild(li);
                    });
                }

                // Render pending FAQs / Oracles 
                const faqBox = document.getElementById('pending-faqs');
                if (faqBox) {
                    if (data.queries.length > 0) faqBox.innerHTML = ''; // wipe silent text if queries exist
                    
                    data.queries.forEach(q => {
                        faqBox.innerHTML += `
                            <div style="border-bottom:var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
                                <p style="color:var(--color-text-main); font-size:0.95rem; font-family:var(--font-heading-alt);">"${q.question}"</p>
                                <small style="color:var(--color-blood-red);">Asked by ${q.asker_reg}</small>
                                <input type="text" id="ans-${q.id}" class="auth-input" placeholder="Whisper an answer back..." style="width:100%; margin:10px 0; padding:10px; box-sizing:border-box;">
                                <button class="btn-primary" style="padding:0.5rem 1rem; width:100%; font-size:0.8rem;" onclick="publishFaq(${q.id}, '${q.question.replace(/'/g,"\\'")}')">Cast Answer & Add To Public Lore</button>
                            </div>
                        `;
                    });
                }
            }
        } catch (error) {
            console.error(error); // This prints hidden bugs silently instead of breaking the matrix now.
            const st = document.getElementById('stat-users');
            if (st) st.innerText = "ERROR";
        }
    };

    renderAdminUI(); // Summon data as soon as script activates!

    // Globals binding for HTML native buttons map hooks inside the async loop boundaries
    window.banishUser = async (target_reg) => {
        if (!confirm(`Are you certain? Sending ${target_reg} into total exile is irreversible.`)) return;
        
        await fetch('/api/admin/banish', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ admin_reg: user.reg_no, target_reg })
        });
        
        renderAdminUI(); // Repaints instantly
    };

    window.publishFaq = async (id, question) => {
        const answer = document.getElementById(`ans-${id}`).value;
        if (!answer) return alert('An answer is required to post the Oracle FAQ to the surface world.');
        
        await fetch('/api/admin/publish-faq', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ admin_reg: user.reg_no, query_id: id, question, answer })
        });
        
        renderAdminUI(); 
    };

});