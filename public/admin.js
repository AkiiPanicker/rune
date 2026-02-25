document.addEventListener('DOMContentLoaded', async () => {
    
    // Core Domain Verification
    const userState = localStorage.getItem('user');
    if (!userState) return window.location.href = 'index.html';

    const user = JSON.parse(userState);
    if (user.reg_no !== '235805126') return window.location.href = 'index.html'; 

    const renderAdminUI = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reg_no: user.reg_no })
            });
            const data = await res.json();
            
            if (data.success) {
                document.getElementById('stat-users').innerText = data.totalUsers;

                const usrList = document.getElementById('user-admin-list');
                if (usrList) {
                    usrList.innerHTML = '';
                    data.allUsers.forEach(soul => {
                        const li = document.createElement('li');
                        li.className = 'recent-user-item';
                        li.style.display = 'flex'; li.style.justifyContent = 'space-between';
                        li.style.alignItems = 'center';
                        
                        let statusTxt = '';
                        if (soul.is_banned) statusTxt = '<span style="color:var(--color-blood-red); margin-left:15px; letter-spacing:2px;">[ EXILED ]</span>';
                        else if (soul.has_entered) statusTxt = '<span style="color:#1aff1a; text-shadow:0 0 5px rgba(26,255,26,0.6); margin-left:15px; letter-spacing:2px;">[ INSIDE REALM ]</span>';

                        const banAction = soul.is_banned || soul.reg_no === '235805126' ? '' : 
                                          `<button onclick="banishUser('${soul.reg_no}')" style="background:transparent; border:1px solid var(--color-blood-red); color:var(--color-blood-red); padding:3px 10px; cursor:pointer;">X Banish</button>`;
                        
                        li.innerHTML = `<div><strong style="color:var(--color-mythic-gold); font-family:var(--font-heading);">${soul.name}</strong> <span style="font-size:0.8rem; margin-left:15px; color:var(--color-text-muted);">${soul.reg_no}</span> ${statusTxt}</div><div>${banAction}</div>`;
                        usrList.appendChild(li);
                    });
                }

                // Resolve pending Questions from users dynamically
                const faqBox = document.getElementById('pending-faqs');
                if (faqBox) {
                    if (data.queries.length > 0) faqBox.innerHTML = '';
                    else faqBox.innerHTML = '<p style="font-size: 0.85rem; color:var(--color-text-muted);">The timeline is silent.</p>';
                    
                    data.queries.forEach(q => {
                        faqBox.innerHTML += `
                            <div style="border-bottom:var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
                                <p style="color:var(--color-text-main); font-size:0.95rem;">"${q.question}"</p>
                                <small style="color:var(--color-blood-red);">Asked by ${q.asker_reg}</small>
                                <input type="text" id="ans-${q.id}" class="auth-input" placeholder="Carve Answer..." style="width:100%; margin:10px 0; padding:10px; box-sizing:border-box;">
                                <button class="btn-primary" style="padding:0.5rem 1rem; width:100%; font-size:0.7rem;" onclick="publishFaq(${q.id}, '${q.question.replace(/'/g,"\\'")}')">Cast Lore & Resolve</button>
                            </div>
                        `;
                    });
                }
            }
        } catch (error) {}
    };

    renderAdminUI(); // Initial Map fetch

    // ===============================================
    // LIVE GATE QR SCANNER ENGINE LOGIC
    // ===============================================
    const scanInput = document.getElementById('scanner-input');
    const scanStatusMsg = document.getElementById('scan-status');
    const scanLaser = document.getElementById('scan-laser');
    
    // Auto Refocus magic preventing Gate Check pauses during crowds:
    document.addEventListener('click', () => { if (document.activeElement.tagName !== 'INPUT') scanInput.focus(); });

    const processScan = async (code_value) => {
        if (!code_value) return;
        scanInput.value = ''; // Instantly clean tube readying consecutive queue handling immediately!
        
        scanStatusMsg.style.color = 'var(--color-mythic-gold)';
        scanStatusMsg.innerText = 'READING RIFT...';
        scanLaser.style.display = 'block'; 
        scanLaser.style.animationDuration = '0.5s'; 
        
        try {
            const res = await fetch('/api/admin/scan', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ admin_reg: user.reg_no, qr_data: code_value })
            });
            const data = await res.json();
            
            setTimeout(() => { // UI Glitch Simulated Buffer Magic
                scanLaser.style.display = 'none'; 
                
                if(data.success) {
                    scanStatusMsg.style.color = '#1aff1a';
                    scanStatusMsg.style.textShadow = '0 0 10px rgba(26,255,26, 0.6)';
                    scanStatusMsg.innerText = data.message;
                } else {
                    scanStatusMsg.style.color = 'red';
                    scanStatusMsg.style.textShadow = '0 0 10px rgba(255,0,0, 0.6)';
                    scanStatusMsg.innerText = data.message;
                }
                
                renderAdminUI(); // Refresh tracking list immediately on success update natively

                // After 3 sec, return back waiting loop. 
                setTimeout(() => {
                    scanStatusMsg.style.color = 'var(--color-blood-red)';
                    scanStatusMsg.innerText = 'AWAITING CODE...';
                }, 3000);

            }, 800);

        } catch (err) {}
    };

    // Submits via "Enter Key" exactly natively mimicing Physical barcode input device hardware. 
    scanInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') processScan(scanInput.value); });
    document.getElementById('manual-scan-btn').addEventListener('click', () => { processScan(scanInput.value); });

    // ===============================================
    // NEW MANUALLY APPENDED FAQS OVERRIDES SYSTEM  
    // ===============================================
    document.getElementById('add-manual-faq').addEventListener('click', async () => {
        const mq = document.getElementById('manual-q').value;
        const ma = document.getElementById('manual-a').value;
        if (!mq || !ma) return alert("Empty scriptures rejected.");
        
        await fetch('/api/admin/add-faq-manual', {
            method:'POST', headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({ admin_reg: user.reg_no, question: mq, answer: ma })
        });

        alert("Lore Added to Homepage Matrix");
        document.getElementById('manual-q').value = '';
        document.getElementById('manual-a').value = '';
    });

    // Window globals mapped inside execution barrier safely for internal HTML rendering references
    window.banishUser = async (target_reg) => {
        if (!confirm(`Cast Registration ${target_reg} out of domain permanently?`)) return;
        await fetch('/api/admin/banish', { method:'POST', headers:{'Content-Type': 'application/json'}, body:JSON.stringify({admin_reg: user.reg_no, target_reg})});
        renderAdminUI(); 
    }
    window.publishFaq = async (id, question) => {
        const answer = document.getElementById(`ans-${id}`).value;
        if (!answer) return;
        await fetch('/api/admin/publish-faq', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({admin_reg:user.reg_no, query_id: id, question, answer})});
        renderAdminUI(); 
    }
});