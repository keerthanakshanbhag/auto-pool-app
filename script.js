let userLocation = null;

// Get Geolocation Coordinates
document.getElementById('geoBtn').addEventListener('click', () => {
    const statusDiv = document.getElementById('locationStatus');
    
    if ("geolocation" in navigator) {
        statusDiv.innerText = "Fetching live GPS coordinates...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                statusDiv.innerText = `✅ GPS Attached (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`;
            },
            () => {
                statusDiv.innerText = "❌ Location permission denied.";
            }
        );
    } else {
        statusDiv.innerText = "Geolocation not supported by browser.";
    }
});

// Handle Form Submission
document.getElementById('poolForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const phone = document.getElementById('studentPhone').value;
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

    const newPool = {
        id: Date.now(),
        name,
        email,
        phone,
        pickup,
        drop,
        time,
        seats,
        location: userLocation
    };

    savePool(newPool);
    renderPools();
    this.reset();
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
        poolList.innerHTML = '<p class="empty-msg">No active student rides currently listed. Post one above!</p>';
        return;
    }

    pools.forEach(pool => {
        const firstLetter = pool.name.charAt(0).toUpperCase();
        
        // WhatsApp Chat Link
        const waMsg = encodeURIComponent(`Hi ${pool.name}, saw your BMSCE Auto Pool request from ${pool.pickup} to ${pool.drop} at ${pool.time}. Is the seat available?`);
        const waLink = `https://wa.me/91${pool.phone}?text=${waMsg}`;

        // Live Google Maps Location Link
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
                    <div class="verified-tag">✓ BMSCE Student (${pool.email})</div>
                </div>
            </div>
            <div class="route-text">🚗 ${pool.pickup} ➔ ${pool.drop}</div>
            <div class="meta-row">
                <span>⏰ Time: <strong>${pool.time}</strong></span>
                <span>👥 Needs: <strong>${pool.seats} seat(s)</strong></span>
            </div>
            <div class="action-buttons">
                <a href="${waLink}" target="_blank" class="btn-whatsapp">💬 Chat on WhatsApp</a>
                <a href="${mapsLink}" target="_blank" class="btn-maps">🗺️ View Meeting Point</a>
            </div>
        `;
        poolList.appendChild(card);
    });
}

document.getElementById('refreshBtn').addEventListener('click', renderPools);
document.addEventListener('DOMContentLoaded', renderPools);