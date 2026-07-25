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
        alert('Pickup and Drop locations cannot be identical!');
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
        rideList.innerHTML = '<p class="empty-msg">No active pool requests right now. Create one above!</p>';
        return;
    }

    rides.forEach(renderRide);
}

function renderRide(ride) {
    const emptyMsg = document.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    // Coordinates for Uber Deep Linking
    // National College Metro: 12.9438, 75.5752
    // BMS College: 12.9416, 75.5684
    let uberUrl = "https://m.uber.com/ul/";
    
    const card = document.createElement('div');
    card.classList.add('ride-card');
    card.innerHTML = `
        <div class="ride-route">${ride.pickup} ➔ ${ride.drop}</div>
        <div class="ride-details">
            <span>⏰ Departure: <strong>${ride.time}</strong></span>
            <span>👥 Needs: <strong>${ride.seats} seat(s)</strong></span>
        </div>
        <div class="card-actions">
            <a href="${uberUrl}" target="_blank" class="btn-uber">🚕 Book Uber Ride</a>
        </div>
    `;

    rideList.prepend(card);
}

clearRidesBtn.addEventListener('click', function() {
    localStorage.removeItem('metroRides');
    loadRides();
});