document.addEventListener('DOMContentLoaded', loadRides);

const rideForm = document.getElementById('rideForm');
const rideList = document.getElementById('rideList');
const clearRidesBtn = document.getElementById('clearRidesBtn');

rideForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const pickup = document.getElementById('pickup').value;
    const drop = document.getElementById('drop').value;
    const time = document.getElementById('time').value;
    const seats = document.getElementById('seats').value;

    if (pickup === drop) {
        alert('Pickup and Drop locations cannot be the same!');
        return;
    }

    const newRide = {
        id: Date.now(),
        pickup,
        drop,
        time,
        seats
    };

    saveRide(newRide);
    renderRide(newRide);
    rideForm.reset();
});

function saveRide(ride) {
    const rides = getRidesFromStorage();
    rides.unshift(ride);
    localStorage.setItem('metroRides', JSON.stringify(rides));
}

function getRidesFromStorage() {
    return JSON.parse(localStorage.getItem('metroRides')) || [];
}

function loadRides() {
    const rides = getRidesFromStorage();
    rideList.innerHTML = '';
    
    if (rides.length === 0) {
        rideList.innerHTML = '<p class="empty-msg">No active ride requests yet. Be the first to post!</p>';
        return;
    }

    rides.forEach(renderRide);
}

function renderRide(ride) {
    const emptyMsg = document.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const card = document.createElement('div');
    card.classList.add('ride-card');
    card.innerHTML = `
        <div class="ride-route">📍 ${ride.pickup} ➔ 🎯 ${ride.drop}</div>
        <div class="ride-details">
            <span>⏰ Time: <strong>${ride.time}</strong></span>
            <span>👥 Needs: <strong>${ride.seats} passenger(s)</strong></span>
        </div>
        <span class="badge">💰 Est. Share: ₹30/person</span>
    `;

    rideList.prepend(card);
}

clearRidesBtn.addEventListener('click', function() {
    localStorage.removeItem('metroRides');
    loadRides();
});