document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const technicianId = urlParams.get('technician_id');
    const date = urlParams.get('date');
    const time = urlParams.get('time');

    const detailsContainer = document.getElementById('booking-details');
    const payNowBtn = document.getElementById('pay-now-btn');
    const payLaterBtn = document.getElementById('pay-later-btn');

    async function fetchBookingDetailsForConfirmation() {
        if (!technicianId) {
            detailsContainer.innerHTML = '<p>Error: Technician ID is missing.</p>';
            return;
        }
        try {
            const response = await fetch(`get_booking_details.php?technician_id=${technicianId}`);
            const result = await response.json();
            if (result.success && result.data) {
                const details = result.data;
                detailsContainer.innerHTML = `
                    <p><strong>Technician:</strong> ${details.name}</p>
                    <p><strong>Service:</strong> ${details.services || 'General Service'}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Price:</strong> ₹${details.price}</p>
                `;
            } else {
                detailsContainer.innerHTML = `<p>Could not retrieve booking details: ${result.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            detailsContainer.innerHTML = '<p>An error occurred while fetching details.</p>';
        }
    }

    async function handleBookingCreation(andPayNow = false) {
        payNowBtn.disabled = true;
        payLaterBtn.disabled = true;
        payLaterBtn.textContent = 'Processing...';

        try {
            const response = await fetch('create_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    technician_id: technicianId,
                    date: date,
                    time: time
                })
            });
            const result = await response.json();

            if (result.success) {
                if (andPayNow) {
                    // If "Pay Now" was clicked, redirect to the payment page with the new payment ID
                    window.location.href = `../Payments/pay.html?payment_id=${result.payment_id}`;
                } else {
                    // If "Pay Later" was clicked, show a success message and then redirect to My Bookings
                    alert('Booking confirmed! You can pay for this service later from the Payments page.');
                    window.location.href = '../my-bookings/index.html';
                }
            } else {
                alert(`Booking failed: ${result.message}`);
                payNowBtn.disabled = false;
                payLaterBtn.disabled = false;
                payLaterBtn.textContent = 'Pay Later';
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Booking failed due to a network error.');
            payNowBtn.disabled = false;
            payLaterBtn.disabled = false;
            payLaterBtn.textContent = 'Pay Later';
        }
    }

    payNowBtn.addEventListener('click', () => handleBookingCreation(true));
    payLaterBtn.addEventListener('click', () => handleBookingCreation(false));

    if (technicianId && date && time) {
        fetchBookingDetailsForConfirmation();
    } else {
        detailsContainer.innerHTML = '<p>Booking details not provided. Please start the booking process again.</p>';
        payNowBtn.style.display = 'none';
        payLaterBtn.style.display = 'none';
        document.getElementById('cancel-link').textContent = 'Back to Dashboard';
    }
});