document.addEventListener('DOMContentLoaded', async () => {
    
    const userState = localStorage.getItem('user');
    if (!userState) return window.location.href = 'index.html';
    const user = JSON.parse(userState);
    if (user.reg_no !== '235805126') return window.location.href = 'index.html'; 

    let completeUserLedger = []; // Save locally for Search filtering

    // ==========================================
    // REPAINT ADMIN UI ENGINE
    // ==========================================
    const renderAdminUI = async () => {
        try {
            const res = await fetch('/api/admin/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reg_no: user.reg_no })});
            const data = await res.json();
            
            if (data.success) {
                // Set memory users globally
                completeUserLedger = data.allUsers;
                document.getElementById('stat-users').innerText = completeUserLedger.length;
                renderUserList(completeUserLedger); // Build the users array UI manually 

                // Oracle Box Generation
                const faqBox = document.getElementById('pending-faqs');
                if (data.queries.length > 0) {
                    faqBox.innerHTML = data.queries.map(q => `<div style="border-bottom:var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;"><p style="color:var(--color-text-main);">"${q.question}"</p><small style="color:var(--color-blood-red);">Asker: ${q.asker_reg}</small><input type="text" id="ans-${q.id}" class="auth-input" placeholder="Type Response..." style="width:100%; margin:10px 0;"><button class="btn-primary" onclick="publishFaq(${q.id}, '${q.question.replace(/'/g,"\\'")}')">Answer To Homepage</button></div>`).join('');
                } else faqBox.innerHTML = 'Zero silent queries remain pending.';
            }

            // CMS Render Artists Blocklists
            const artsRes = await fetch('/api/artists').then(r=>r.json());
            const artList = document.getElementById('manage-artist-list');
            artList.innerHTML = artsRes.data.map(a => `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;"><span><strong>${a.name}</strong> - ${a.role}</span> <button onclick="delArt(${a.id})" style="color:red; background:none; border:none; cursor:pointer;">[x]</button></div>`).join('');
            
            // CMS Render Sponsors Blocklists
            const spRes = await fetch('/api/sponsors').then(r=>r.json());
            const spList = document.getElementById('manage-sponsor-list');
            spList.innerHTML = spRes.data.map(s => `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;"><span><strong>${s.name}</strong> (${s.link_url})</span> <button onclick="delSponsor(${s.id})" style="color:red; background:none; border:none; cursor:pointer;">[x]</button></div>`).join('');
            
        } catch(e){}
    };
    renderAdminUI();

    // ==========================================
    // JS ARRAY FILTER LOGIC (SEARCH)
    // ==========================================
    const renderUserList = (list) => {
        const usrHTML = document.getElementById('user-admin-list');
        usrHTML.innerHTML = list.map(soul => {
            let sTxt = '';
            if (soul.is_banned) sTxt = '<span style="color:red; margin-left:10px;">[ EXILED ]</span>';
            else if (soul.has_entered) sTxt = '<span style="color:#1aff1a; margin-left:10px;">[ ADMITTED INSIDE ]</span>';
            const banBtn = (soul.is_banned || soul.reg_no === '235805126') ? '' : `<button onclick="banishUser('${soul.reg_no}')" style="background:transparent; border:1px solid red; color:red; cursor:pointer;">Banish X</button>`;
            
            return `<li class="recent-user-item" style="display:flex; justify-content:space-between;"><div><strong style="color:var(--color-mythic-gold);">${soul.name}</strong><br><span style="font-size:0.8rem; color:var(--color-text-muted);">E: ${soul.email} | Reg: ${soul.reg_no} ${sTxt}</span></div>${banBtn}</li>`;
        }).join('');
    };

    // Attach native live-filtering Event
    document.getElementById('user-search').addEventListener('keyup', (e) => {
        const trg = e.target.value.toLowerCase();
        const results = completeUserLedger.filter(s => s.name.toLowerCase().includes(trg) || s.reg_no.includes(trg) || s.email.toLowerCase().includes(trg));
        renderUserList(results);
    });

    // ==========================================
    // QR SCANNER BEHAVIOR 
    // ==========================================
    const scanInput = document.getElementById('scanner-input');
    scanInput.addEventListener('keyup', async (e) => {
        if(e.key === 'Enter') {
            const v = scanInput.value;
            scanInput.value = '';
            const status = document.getElementById('scan-status');
            
            try {
                const r = await fetch('/api/admin/scan', {method: 'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, qr_data: v })});
                const d = await r.json();
                status.innerText = d.message;
                status.style.color = d.success ? '#1aff1a' : 'red';
                setTimeout(()=> { status.style.color = 'var(--color-blood-red)'; status.innerText = 'AWAITING TICKET...'; }, 2000);
                renderAdminUI(); // Push admitted boolean visibly behind instantly
            } catch(ex){}
        }
    });

    // ==========================================
    // EXPOSED CMS GLOBAL FUNCS FOR NATIVE CLICKS
    // ==========================================
    document.getElementById('add-manual-faq').addEventListener('click', async () => {
        const q = document.getElementById('manual-q').value, a = document.getElementById('manual-a').value;
        if(q&&a) {
            await fetch('/api/admin/add-faq-manual', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, question: q, answer: a }) });
            alert('Custom FAQ Forced Active.');
        }
    });
    
    window.banishUser = async (tr) => { if(confirm(`Banish Reg ${tr}?`)) { await fetch('/api/admin/banish', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({admin_reg: user.reg_no, target_reg: tr})}); renderAdminUI(); }};
    window.publishFaq = async (id, q) => { const a = document.getElementById(`ans-${id}`).value; if(a) { await fetch('/api/admin/publish-faq', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({admin_reg:user.reg_no, query_id: id, question: q, answer: a})}); renderAdminUI(); }};

    window.addArtist = async () => {
        const n = document.getElementById('art-name').value;
        const r = document.getElementById('art-role').value;
        const imgLink = document.getElementById('art-image').value;
        
        if (n && r) { 
            await fetch('/api/admin/add-artist', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ admin_reg: user.reg_no, name: n, role: r, image_url: imgLink }) 
            }); 
            // Wipe forms post-add natively 
            document.getElementById('art-name').value = '';
            document.getElementById('art-role').value = '';
            document.getElementById('art-image').value = '';
            renderAdminUI(); 
        }
    };
    window.delArt = async (id) => { await fetch('/api/admin/del-artist', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, id: id }) }); renderAdminUI(); };

    window.addSponsor = async () => {
        const n = document.getElementById('spo-name').value, l = document.getElementById('spo-link').value;
        if(n) { await fetch('/api/admin/add-sponsor', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, name: n, link_url: l }) }); renderAdminUI(); }
    };
    window.delSponsor = async (id) => { await fetch('/api/admin/del-sponsor', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ admin_reg: user.reg_no, id: id }) }); renderAdminUI(); };

});