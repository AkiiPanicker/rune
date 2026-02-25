document.addEventListener('DOMContentLoaded', async () => {
    
    // GUARD 1: Check LocalStorage Presence
    const userState = localStorage.getItem('user');
    if (!userState) {
        window.location.href = 'index.html'; // Exile Mortal
        return;
    }

    const user = JSON.parse(userState);

    // GUARD 2: Check Akshat's Registration Key Match
    if (user.reg_no !== '235805126') {
        window.location.href = 'index.html'; // Banish non-admin
        return;
    }

    // Now safely fetch live db parameters
    try {
        const res = await fetch('/api/admin/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reg_no: user.reg_no })
        });

        const data = await res.json();
        if (data.success) {
            // Update Dynamic Counter
            document.getElementById('stat-users').innerText = data.totalUsers;
            document.getElementById('stat-users').setAttribute('data-text', data.totalUsers);

            // Populate Latest Registered Users
            const recentList = document.getElementById('recent-list');
            recentList.innerHTML = ''; // clear loading text

            data.recentUsers.forEach(soul => {
                const li = document.createElement('li');
                li.className = 'recent-user-item';
                // Render nicely (eg. John Doe | 23000 | Date)
                li.innerHTML = `<strong>${soul.name}</strong> <span style="float:right; opacity:0.5;">${soul.reg_no}</span>`;
                recentList.appendChild(li);
            });

        }
    } catch (error) {
        document.getElementById('stat-users').innerText = "ERROR";
    }

    // The fake Scanner Interaction Logic for presentation
    const scanBtn = document.getElementById('test-scan-btn');
    const statusMsg = document.getElementById('scan-status');
    const scanLine = document.querySelector('.scan-line');

    scanBtn.addEventListener('click', () => {
        statusMsg.style.color = 'var(--color-mythic-gold)';
        statusMsg.innerText = 'READING RUNE RIFT...';
        scanLine.style.animationDuration = "0.5s"; // speed up line

        // Pretend processing takes 1.5 seconds, then accept the user ticket
        setTimeout(() => {
            statusMsg.style.color = '#1aff1a'; // bright accept green
            statusMsg.style.textShadow = '0 0 10px rgba(26,255,26, 0.6)';
            statusMsg.innerText = 'MORTAL GRANTED ADMISSION';
            
            // Rest after showing accept
            setTimeout(() => {
                scanLine.style.animationDuration = "2s";
                statusMsg.style.color = 'var(--color-blood-red)';
                statusMsg.style.textShadow = '0 0 5px var(--color-blood-glow)';
                statusMsg.innerText = 'AWAITING TICKET RUNES...';
            }, 3000);

        }, 1500);
    });
});