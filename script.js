document.getElementById('rideForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const pickup = document.getElementById('pickup').value;
    const drop = document.getElementById('drop').value;
    const time = document.getElementById('time').value;

    const rideList = document.getElementById('rideList');

    const card = document.createElement('div');
    card.classList.add('ride-card');
    card.innerHTML = `
        <strong>📍 From:</strong> ${pickup}<br>
        <strong>🎯 To:</strong> ${drop}<br>
        <strong>⏰ Time:</strong> ${time}<br>
        <small>🟢 Looking for 2 co-passengers to share auto!</small>
    `;

    rideList.prepend(card);
    document.getElementById('rideForm').reset();
});