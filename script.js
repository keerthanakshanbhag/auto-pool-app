let userLocation = null;
let currentRideId = null;
let peer = null;

// Lock and Remember Email Functionality
function checkSavedEmail() {
    const savedEmail = localStorage.getItem('bmsce_user_email');
    if (savedEmail) {
        const emailInput = document.getElementById('studentEmail');
        emailInput.value = savedEmail;
        emailInput.readOnly = true;
        emailInput.style.opacity = '0.7';
    }
}

// GPS Attach
document.getElementById('geoBtn').addEventListener('click', () => {
    const statusDiv = document.getElementById('locationStatus');
    if ("geolocation" in navigator) {
        statusDiv.innerText = "Fetching live GPS...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                statusDiv.innerText = `✅ GPS Attached (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})`;
            },
            () => statusDiv.innerText = "❌ Location permission denied."
        );
    }
});

// Submit Ride Form
document.getElementById('poolForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value || 'BMSCEian';
    const email = document.getElementById('studentEmail').value;
    const pickup = document.getElementById('pickupLoc').value;
    const drop = document.getElementById('dropLoc').value;
    const time = document.getElementById('depTime').value;
    const seats = document.getElementById('seatsNeeded').value;

    if (pickup === drop) {
        alert("Pickup and Drop points cannot be identical.");
        return;
    }

    if (!email.endsWith('@bmsce.ac.in')) {
        alert("Only official BMSCE email addresses (@bmsce.ac.in) are allowed!");
        return;
    }

    // Remember Email for future visits
    localStorage.setItem('bmsce_user_email', email);

    const newPool = {
        id: 'pool-' + Date.now(),
        name,
        email,
        pickup,
        drop,
        time,
        seats,
        location: userLocation
    };

    savePool(newPool);
    renderPools();
    this.reset();
    checkSavedEmail();
    document.getElementById('locationStatus').innerText = "";
    userLocation = null;
});

function savePool(pool) {
    const pools = JSON.parse(localStorage.getItem('bmscePools')) || [];
    pools.unshift(pool);
    localStorage.setItem('bmscePools', JSON.stringify(pools));
}

function renderPools() {
    const poolList = document.getElementById('poolList');
    const pools = JSON.parse(localStorage.getItem('bmscePools')) || [];

    poolList.innerHTML = '';

    if (pools.length === 0) {
        poolList.innerHTML = '<p class="sub-text" style="text-align:center;">No active rides listed. Be the first to post!</p>';
        return;
    }

    pools.forEach(pool => {
        const firstLetter = pool.name.charAt(0).toUpperCase();

        let mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pool.pickup)}`;
        if (pool.location) {
            mapsLink = `https://www.google.com/maps?q=${pool.location.lat},${pool.location.lng}`;
        }

        const card = document.createElement('div');
        card.classList.add('pool-card');
        card.innerHTML = `
            <div class="student-info">
                <div class="avatar">${firstLetter}</div>
                <div>
                    <div><strong>${pool.name}</strong></div>
                    <div class="verified-tag">✓ BMSCE Verified (${pool.email})</div>
                </div>
            </div>
            <div class="route-text">🚗 ${pool.pickup} ➔ ${pool.drop}</div>
            <div class="meta-row">
                <span>⏰ Time: <strong>${pool.time}</strong></span>
                <span>👥 Needs: <strong>${pool.seats} seat(s)</strong></span>
            </div>
            <div class="action-buttons">
                <button onclick="openChat('${pool.id}', '${pool.name}')" class="btn-chat-action">🔒 Chat / Call</button>
                <a href="${mapsLink}" target="_blank" class="btn-maps">🗺️ Meeting Point</a>
            </div>
        `;
        poolList.appendChild(card);
    });
}

// Broadcast Uber Ride Info
document.getElementById('broadcastUberBtn').addEventListener('click', () => {
    const autoNo = document.getElementById('autoNumber').value.trim();
    const otp = document.getElementById('autoOtp').value.trim();
    const display = document.getElementById('uberShareDisplay');

    if (!autoNo || !otp) {
        alert("Please enter both Auto Number and Uber OTP.");
        return;
    }

    display.classList.remove('hidden');
    display.innerHTML = `
        🛺 <strong>Uber Auto Booked!</strong><br>
        🚘 <strong>Auto No:</strong> ${autoNo}<br>
        🔑 <strong>Uber OTP:</strong> ${otp}<br>
        <small style="color:#64748b;">Share this with co-passengers when boarding.</small>
    `;
});

// PeerJS Anonymous Voice Call Init
function initPeer() {
    if (!peer) {
        peer = new Peer();
        peer.on('call', (call) => {
            if (confirm("Incoming anonymous voice call. Accept?")) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    call.answer(stream);
                    call.on('stream', (remoteStream) => {
                        document.getElementById('remoteAudio').srcObject = remoteStream;
                    });
                    document.getElementById('callStatusText').innerText = "🔊 Call Connected!";
                });
            }
        });
    }
}

function openChat(rideId, name) {
    currentRideId = rideId;
    initPeer();
    document.getElementById('chatTitle').innerText = `Connect with ${name}`;
    document.getElementById('chatModal').classList.remove('hidden');
}

document.getElementById('startCallBtn').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        document.getElementById('callStatusText').innerText = "Dialing co-passenger...";
        const call = peer.call(currentRideId, stream);
        call.on('stream', (remoteStream) => {
            document.getElementById('remoteAudio').srcObject = remoteStream;
            document.getElementById('callStatusText').innerText = "🔊 Call Connected!";
        });
    }).catch(() => {
        alert("Microphone permission required for calling.");
    });
});

document.getElementById('closeChat').addEventListener('click', () => {
    document.getElementById('chatModal').classList.add('hidden');
});

document.getElementById('sendChatBtn').addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const chatContainer = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', 'user');
    msgDiv.innerText = text;
    chatContainer.appendChild(msgDiv);
    
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

document.getElementById('refreshBtn').addEventListener('click', renderPools);

document.addEventListener('DOMContentLoaded', () => {
    checkSavedEmail();
    renderPools();
});