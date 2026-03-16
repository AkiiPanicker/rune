document.addEventListener('DOMContentLoaded', async () => {
    
    // Auth Validation Check
    const userState = localStorage.getItem('user');
    if (!userState) return window.location.href = 'index.html';
    const user = JSON.parse(userState);
    if (user.reg_no !== '235805126') return window.location.href = 'index.html'; 

    let completeUserLedger = [];

    // ==========================================
    // REPAINT ADMIN UI ENGINE
    // ==========================================
    const renderAdminUI = async () => {
        // --- 1. RENDER LEDGER / FAQS ---
        try {
            const res = await fetch('/api/admin/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reg_no: user.reg_no })});
            const data = await res.json();
            
            if (data.success) {
                completeUserLedger = data.allUsers;
                document.getElementById('stat-users').innerText = completeUserLedger.length;
                renderUserList(completeUserLedger); 

                const faqBox = document.getElementById('pending-faqs');
                if (data.queries.length > 0) {
                    faqBox.innerHTML = data.queries.map(q => `<div style="border-bottom:var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;"><p style="color:var(--color-text-main);">"${q.question}"</p><small style="color:var(--color-blood-red);">Asker: ${q.asker_reg}</small><input type="text" id="ans-${q.id}" class="auth-input" placeholder="Type Response..." style="width:100%; margin:10px 0;"><button class="btn-primary" onclick="publishFaq(${q.id}, '${q.question.replace(/'/g,"\\'")}')">Answer To Homepage</button></div>`).join('');
                } else faqBox.innerHTML = 'Zero silent queries remain pending.';
            }
        } catch(e) { console.log("Silent error rendering users."); }

        // --- 2. RENDER PANTHEON ROSTER WITH ADVANCED DATA CHECKS ---
        try {
            const artsRes = await fetch('/api/artists').then(r=>r.json());
            const artList = document.getElementById('manage-artist-list');
            
            artList.innerHTML = artsRes.data.map(a => {
                let statusBadge = "";
                
                // Bulletproof Logic Fallback (Protects old data items)
                if (a.reveal_date) {
                    const targetMs = new Date(a.reveal_date).getTime();
                    // Has not reached target target Date yet:
                    if (!isNaN(targetMs) && Date.now() < targetMs) {
                        statusBadge = `<span style="color:#f39c12; font-size:0.75rem; letter-spacing:1px;">(Hatching: ${new Date(a.reveal_date).toLocaleString('en-IN')})</span>`;
                    } else {
                        // Math triggered they have passed deadline!
                        statusBadge = `<span style="color:#1aff1a; font-size:0.75rem; letter-spacing:1px;">(Fully Revealed & Visible)</span>`;
                    }
                } else {
                    // Item lacks proper dates, default unlocked flag status 
                    statusBadge = `<span style="color:#1aff1a; font-size:0.75rem; letter-spacing:1px;">(Live on homepage instantly)</span>`;
                }
                
                return `<div style="padding:15px; margin-bottom: 10px; background:rgba(0,0,0,0.6); border:1px solid rgba(224, 170, 255, 0.2); border-left:4px solid var(--color-blood-red); border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:1.1rem; color:var(--color-mythic-gold); font-family:var(--font-heading);">${a.name || 'UNKNOWN ID'}</strong> 
                        <span style="font-size:0.85rem; color:#fff; margin-left: 10px;"> [${a.role || ''}]</span> <br/>
                        ${statusBadge}
                    </div>
                    <button onclick="delArt(${a.id})" class="btn-primary" style="padding:0.4rem 1rem; font-size:0.8rem; border-color:red; color:red; cursor:pointer; background:transparent;">Delete Item [X]</button>
                </div>`
            }).join('');
        } catch(e) { console.error('Art rendering tripped safely handled: ', e); }
        
        // --- 3. RENDER SPONSORS ---
        try {
            const spRes = await fetch('/api/sponsors').then(r=>r.json());
            const spList = document.getElementById('manage-sponsor-list');
            spList.innerHTML = spRes.data.map(s => `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;"><span><strong>${s.name}</strong> (${s.link_url})</span> <button onclick="delSponsor(${s.id})" style="color:red; background:none; border:none; cursor:pointer;">[x]</button></div>`).join('');
        } catch(e) {}
    };

    renderAdminUI(); // Draw UI Instantly on window focus

    // ==========================================
    // JS ARRAY FILTER LOGIC (USER SEARCH)
    // ==========================================
    const renderUserList = (list) => {
        const usrHTML = document.getElementById('user-admin-list');
        usrHTML.innerHTML = list.map(soul => {
            let sTxt = '';
            if (soul.is_banned) sTxt = '<span style="color:red; margin-left:10px;">[ EXILED ]</span>';
            else if (soul.has_entered) sTxt = '<span style="color:#1aff1a; margin-left:10px;">[ ADMITTED INSIDE ]</span>';
            const banBtn = (soul.is_banned || soul.reg_no === '235805126') ? '' : `<button onclick="banishUser('${soul.reg_no}')" style="background:transparent; border:1px solid red; color:red; cursor:pointer;">Banish X</button>`;
            return `<li class="recent-user-item" style="display:flex; justify-content:space-between; padding: 10px; background:rgba(20,20,30,0.5); border-bottom:1px solid #111;"><div><strong style="color:var(--color-mythic-gold);">${soul.name}</strong><br><span style="font-size:0.8rem; color:var(--color-text-muted);">E: ${soul.email} | Reg: ${soul.reg_no} ${sTxt}</span></div>${banBtn}</li>`;
        }).join('');
    };

    // Global native search attachment block
    document.getElementById('user-search').addEventListener('keyup', (e) => {
        const trg = e.target.value.toLowerCase();
        const results = completeUserLedger.filter(s => s.name.toLowerCase().includes(trg) || s.reg_no.includes(trg) || s.email.toLowerCase().includes(trg));
        renderUserList(results);
    });

    // ==========================================
    // ADMIN OVERRIDE ENGINE: DYNAMICS CATCH AND DISPATCH
    // ==========================================
    document.getElementById('add-manual-faq').addEventListener('click', async () => {
        const q = document.getElementById('manual-q').value, a = document.getElementById('manual-a').value;
        if(q&&a) {
            await fetch('/api/admin/add-faq-manual', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, question: q, answer: a }) });
            document.getElementById('manual-q').value = ''; document.getElementById('manual-a').value = '';
            renderAdminUI(); alert('Prophecy Burned Successfully.');
        }
    });
    
    window.banishUser = async (tr) => { if(confirm(`Banish Reg ${tr}?`)) { await fetch('/api/admin/banish', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({admin_reg: user.reg_no, target_reg: tr})}); renderAdminUI(); }};
    window.publishFaq = async (id, q) => { const a = document.getElementById(`ans-${id}`).value; if(a) { await fetch('/api/admin/publish-faq', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({admin_reg:user.reg_no, query_id: id, question: q, answer: a})}); renderAdminUI(); }};

    window.addArtist = async () => {
        // Collect exact attributes bound to modified form DOM objects 
        const n = document.getElementById('art-name').value;
        const r = document.getElementById('art-role').value;
        const imgLink = document.getElementById('art-image').value;
        const desc = document.getElementById('art-desc').value;
        const rev = document.getElementById('art-reveal').value;
        
        if (n && r) { 
            // Lock and commit string properties payload across Matrix boundary into core tables
            await fetch('/api/admin/add-artist', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ admin_reg: user.reg_no, name: n, role: r, image_url: imgLink, description: desc, reveal_date: rev }) 
            }); 
            // Natively Clear Form Buffer Block Elements On Completion Loop Iteration End Frame State Sweep Clean Procedure Matrix Code Core Dump Initialization End File Script File Exit True Line End 
            document.getElementById('art-name').value = '';
            document.getElementById('art-role').value = '';
            document.getElementById('art-image').value = '';
            
            // Critical fail-checks verify HTML modification matching existence of attributes inside form core template memory logic module execution bypass  
            if(document.getElementById('art-desc')) document.getElementById('art-desc').value = '';
            if(document.getElementById('art-reveal')) document.getElementById('art-reveal').value = '';

            renderAdminUI(); // Visually bounce into list memory refresh cache trigger automatically below target form instantly after entry insertion! 
        }
    };

    window.delArt = async (id) => { await fetch('/api/admin/del-artist', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, id: id }) }); renderAdminUI(); };
    
    window.addSponsor = async () => {
        const n = document.getElementById('spo-name').value, l = document.getElementById('spo-link').value;
        if(n) { await fetch('/api/admin/add-sponsor', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, name: n, link_url: l }) }); 
        document.getElementById('spo-name').value = ''; document.getElementById('spo-link').value='';
        renderAdminUI(); }
    };

    window.delSponsor = async (id) => { await fetch('/api/admin/del-sponsor', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, id: id }) }); renderAdminUI(); };
});