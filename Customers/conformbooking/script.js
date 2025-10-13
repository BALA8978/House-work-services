document.addEventListener('DOMContentLoaded', function() {
    const detailsContainer = document.getElementById('booking-details');
    const priceContainer = document.getElementById('price-details');
    const confirmPayBtn = document.getElementById('confirm-pay-btn');
    const payLaterBtn = document.getElementById('pay-later-btn');
    const confirmationView = document.getElementById('confirmation-view');
    const successView = document.getElementById('success-view');

    const urlParams = new URLSearchParams(window.location.search);
    const technicianId = urlParams.get('technician_id');
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const description = urlParams.get('description'); 

    async function fetchBookingDetails() {
        if (!technicianId) {
            detailsContainer.innerHTML = '<p class="loading-text" style="color: red;">Error: Technician ID is missing.</p>';
            return;
        }
        try {
            const response = await fetch(`get_booking_details.php?technician_id=${technicianId}`);
            const result = await response.json();

            if (result.success && result.data) {
                renderDetails(result.data);
                confirmPayBtn.disabled = false;
                payLaterBtn.disabled = false;
            } else {
                detailsContainer.innerHTML = `<p class="loading-text" style="color: red;">Could not retrieve booking details: ${result.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            detailsContainer.innerHTML = '<p class="loading-text" style="color: red;">An error occurred while fetching details.</p>';
        }
    }

    function renderDetails(details) {
        detailsContainer.innerHTML = `
            <p><strong>Technician:</strong> <span>${details.name}</span></p>
            <p><strong>Service:</strong> <span>${details.services || 'General Service'}</span></p>
            <p><strong>Date:</strong> <span>${date}</span></p>
            <p><strong>Time:</strong> <span>${time}</span></p>
            ${description ? `<p><strong>Description:</strong> <span>${decodeURIComponent(description)}</span></p>` : ''}
        `;

        const serviceFee = parseFloat(details.price);
        const taxRate = 0.18;
        const serviceTax = serviceFee * taxRate;
        const totalAmount = serviceFee + serviceTax;

        priceContainer.innerHTML = `
            <div class="price-row">
                <span>Service Fee:</span>
                <span>₹${serviceFee.toFixed(2)}</span>
            </div>
            <div class="price-row">
                <span>Service Tax (GST @18%):</span>
                <span>₹${serviceTax.toFixed(2)}</span>
            </div>
            <div class="price-row total">
                <span>Total Amount Payable:</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
        `;
    }

    async function handleBookingCreation(payNow = false) {
        confirmPayBtn.disabled = true;
        payLaterBtn.disabled = true;
        payLaterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const response = await fetch('create_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    technician_id: technicianId,
                    date: date,
                    time: time,
                    description: description 
                })
            });
            const result = await response.json();

            if (result.success) {
                if (payNow) {
                    window.location.href = `../Payments/pay.html?payment_id=${result.payment_id}`;
                } else {
                    confirmationView.style.display = 'none';
                    successView.style.display = 'block';
                }
            } else {
                alert(`Booking Failed: ${result.message}`);
                confirmPayBtn.disabled = false;
                payLaterBtn.disabled = false;
                payLaterBtn.innerHTML = '<i class="fas fa-clock"></i> Confirm & Pay Later';
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Booking failed due to a network error.');
            confirmPayBtn.disabled = false;
            payLaterBtn.disabled = false;
            payLaterBtn.innerHTML = '<i class="fas fa-clock"></i> Confirm & Pay Later';
        }
    }

    confirmPayBtn.addEventListener('click', () => handleBookingCreation(true));
    payLaterBtn.addEventListener('click', () => handleBookingCreation(false));

    if (technicianId && date && time) {
        fetchBookingDetails();
    } else {
        detailsContainer.innerHTML = '<p class="loading-text" style="color: red;">Booking details not provided. Please start again.</p>';
    }
});