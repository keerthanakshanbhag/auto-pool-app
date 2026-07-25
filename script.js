let currentActiveRide = null;

// Tab Switcher Logic
document.getElementById('tabFind').addEventListener('click', () => switchTab('find'));
document.getElementById('tabPost').addEventListener('click', () => switchTab('post'));

function switchTab(tab) {
    document.getElementById('tabFind').classList.toggle('active', tab === 'find');
    document.getElementById('tabPost').classList.toggle('active', tab === 'post');
    document.getElementById('viewFind').classList.toggle('active', tab === 'find');
    document.getElementById('viewPost').classList.toggle('active', tab === 'post');
}

// Remember Email
function checkSavedEmail() {
    const savedEmail = localStorage.getItem('bmsce_email');
    if (savedEmail) {
        const input = document.getElementById('studentEmail');
        input.value = savedEmail;
        input.readOnly = true;
    }
}

// Create Pool (User = Captain)
document.getElementById('poolForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value || 'BMSCEian';
    const email = document.getElementById('studentEmail').value;
    const pickup = document.getElementById('pickupLoc').value;
    const drop = document.getElementById('dropLoc').value;
    const time = document.getElementById('depTime').value;
    const seats = document.getElementById('seatsNeeded').value;

    if (pickup === drop) {
        alert("Pickup and Drop locations cannot be the same.");
        return;
    }

    localStorage.setItem('bmsce_email', email);

    const newRide = {
        id: 'ride-' + Date.now(),
        captainName: name,
        captainEmail: email,
        pickup,
        drop,
        time,
        seats,
        uberBooked: false,
        autoNo: '',
        otp: ''
    };

    const rides = JSON.parse(localStorage.getItem('bmscePoolRides')) || [];
    rides.unshift(newRide);
    localStorage.setItem('bmscePoolRides', JSON.stringify(rides));

    this.reset();
    checkSavedEmail();
    switchTab('find');
    renderRides();
});

// Render Ride Cards
function renderRides() {
    const list = document.getElementById('poolList');
    const rides = JSON.parse(localStorage.getItem('bmscePoolRides')) || [];
    const myEmail = localStorage.getItem('bmsce_email');

    list.innerHTML = '';

    if (rides.length === 0) {
        list.innerHTML = '<p style="font-size:12px; color:#94a3b8; text-align:center;">No active rides listed right now.</p>';
        return;
    }

    rides.forEach(ride => {
        const isCaptain = ride.captainEmail === myEmail;
        const card = document.createElement('div');
        card.classList.add('pool-card');
        card.innerHTML = `
            <div class="card-top">
                <div class="user-info">
                    <div class="avatar">${ride.captainName.charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>${ride.captainName}</strong>
                        <span class="badge-role">${isCaptain ? '👑 You (Captain)' : 'Captain'}</span>
                    </div>
                </div>
            </div>
            <div class="route">🚗 ${ride.pickup} ➔ ${ride.drop}</div>
            <div class="details-row">
                <span>⏰ Time: <strong>${ride.time}</strong></span>
                <span>👥 Needs: <strong>${ride.seats} seat(s)</strong></span>
            </div>
            <button onclick="openRideHub('${ride.id}')" class="btn-primary">
                ${isCaptain ? 'Manage Ride & Uber 🛺' : 'Join & Chat 🔒'}
            </button>
        `;
        list.appendChild(card);
    });
}

// Open Ride Hub Modal
function openRideHub(rideId) {
    const rides = JSON.parse(localStorage.getItem('bmscePoolRides')) || [];
    currentActiveRide = rides.find(r => r.id === rideId);
    if (!currentActiveRide) return;

    const myEmail = localStorage.getItem('bmsce_email');
    const isCaptain = currentActiveRide.captainEmail === myEmail;

    document.getElementById('modalTitle').innerText = `Pool Hub: ${currentActiveRide.pickup.split('(')[0]}`;
    document.getElementById('captainUberBox').classList.toggle('hidden', !isCaptain);
    document.getElementById('passengerUberBox').classList.toggle('hidden', isCaptain || currentActiveRide.uberBooked);
    
    updateUberCardDisplay();
    document.getElementById('rideModal').classList.remove('hidden');
}

// Share Uber Credentials (Captain Action)
document.getElementById('shareUberDetailsBtn').addEventListener('click', () => {
    const autoNo = document.getElementById('uberAutoNo').value.trim();
    const otp = document.getElementById('uberOtp').value.trim();

    if (!autoNo || !otp) {
        alert("Please enter both Auto Number and OTP.");
        return;
    }

    currentActiveRide.uberBooked = true;
    currentActiveRide.autoNo = autoNo;
    currentActiveRide.otp = otp;

    const rides = JSON.parse(localStorage.getItem('bmscePoolRides')) || [];
    const index = rides.findIndex(r => r.id === currentActiveRide.id);
    if (index !== -1) {
        rides[index] = currentActiveRide;
        localStorage.setItem('bmscePoolRides', JSON.stringify(rides));
    }

    updateUberCardDisplay();
});

function updateUberCardDisplay() {
    const liveCard = document.getElementById('liveUberCard');
    if (currentActiveRide && currentActiveRide.uberBooked) {
        liveCard.classList.remove('hidden');
        document.getElementById('passengerUberBox').classList.add('hidden');
        liveCard.innerHTML = `
            🛺 <strong>Uber Auto Booked by Captain</strong><br>
            🚘 <strong>Auto No:</strong> ${currentActiveRide.autoNo}<br>
            🔑 <strong>Uber OTP:</strong> ${currentActiveRide.otp}
        `;
    } else {
        liveCard.classList.add('hidden');
    }
}

// Modal Controls
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('rideModal').classList.add('hidden');
});

// Chat Send
document.getElementById('sendMsgBtn').addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const box = document.getElementById('chatBox');
    const msg = document.createElement('div');
    msg.classList.add('msg', 'user');
    msg.innerText = text;
    box.appendChild(msg);
    input.value = '';
    box.scrollTop = box.scrollHeight;
});

document.getElementById('refreshBtn').addEventListener('click', renderRides);

document.addEventListener('DOMContentLoaded', () => {
    checkSavedEmail();
    renderRides();
});