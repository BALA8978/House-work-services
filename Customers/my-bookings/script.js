document.addEventListener('DOMContentLoaded', function() {
    // --- INITIAL DATA FETCH ---
    fetchBookingHistory();
    fetchRecurringServices();

    // --- MODAL ELEMENTS & EVENT LISTENERS ---
    const addNewServiceBtn = document.getElementById('add-new-service-btn');
    const modal = document.getElementById('add-service-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Functions to control the modal ---
    function openModal() {
        modal.style.display = 'flex';
        loadAvailableServices();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // --- Event Listeners for the modal ---
    if (addNewServiceBtn) {
        addNewServiceBtn.addEventListener('click', openModal);
    }

    // This check prevents the error. If the button exists, it adds the listener.
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal if user clicks outside of the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});

/**
 * Fetches and displays the booking history, including the "Cancel" button.
 */
async function fetchBookingHistory() {
    const historyList = document.getElementById('booking-history-list');
    try {
        const response = await fetch('get_booking_history.php');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            historyList.innerHTML = '';
            result.data.forEach(booking => {
                const bookingCard = document.createElement('div');
                bookingCard.className = 'booking-card';

                bookingCard.innerHTML = `
                    <div class="booking-details">
                        <h3>Service with ${booking.technician_name}</h3>
                        <p><strong>Date:</strong> ${booking.booking_date}</p>
                        <p><strong>Time:</strong> ${booking.booking_time}</p>
                        <p><strong>Status:</strong> <span class="booking-status ${booking.status}">${booking.status}</span></p>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-card-action contact-technician-btn" data-technician="${booking.technician_name}"><i class="fas fa-phone"></i> Contact</button>
                        <button class="btn btn-card-action btn-cancel" onclick="cancelBooking(${booking.booking_id})"><i class="fas fa-times"></i> Cancel</button>
                    </div>
                `;
                // Only show the cancel button for 'Confirmed' bookings
                if (booking.status !== 'Confirmed') {
                    const cancelButton = bookingCard.querySelector('.btn-cancel');
                    if (cancelButton) {
                        cancelButton.style.display = 'none';
                    }
                }

                historyList.appendChild(bookingCard);
            });

            // Re-add event listeners for contact buttons after rendering
            document.querySelectorAll('.contact-technician-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const technicianName = this.getAttribute('data-technician');
                    window.location.href = `../contact/contact.html?technician=${encodeURIComponent(technicianName)}`;
                });
            });

        } else {
            historyList.innerHTML = '<p>No booking history found.</p>';
        }
    } catch (error) {
        console.error('Error fetching booking history:', error);
        historyList.innerHTML = '<p>Could not load booking history.</p>';
    }
}

/**
 * Fetches and displays recurring services available for the user.
 */
async function fetchRecurringServices() {
    const recurringList = document.getElementById('recurring-services-list');
    try {
        const response = await fetch('get_recurring_services.php');
        const services = await response.json();

        if (services.success && services.data.length > 0) {
            recurringList.innerHTML = '';
            services.data.forEach(service => {
                const recurringCard = document.createElement('div');
                recurringCard.className = 'recurring-card';
                recurringCard.innerHTML = `
                    <div class="recurring-details">
                        <h3>${service.service_description}</h3>
                        <p><strong>Frequency:</strong> ${service.frequency}</p>
                        <p><strong>Next Service Date:</strong> ${service.next_service_date}</p>
                    </div>
                    <div class="recurring-actions">
                        <button class="btn">Manage</button>
                    </div>
                `;
                recurringList.appendChild(recurringCard);
            });
        } else {
            recurringList.innerHTML = '<p>No recurring services found.</p>';
        }
    } catch (error) {
        console.error('Error fetching recurring services:', error);
        recurringList.innerHTML = '<p>Could not load recurring services.</p>';
    }
}

/**
 * Fetches and displays available recurring services in the modal.
 */
async function loadAvailableServices() {
    const modalServiceList = document.getElementById('modal-service-list');
    modalServiceList.innerHTML = '<p>Loading available services...</p>';
    try {
        const response = await fetch('get_weekly_monthly_services.php');
        const services = await response.json();

        if (services.success && services.data.length > 0) {
            modalServiceList.innerHTML = '';
            services.data.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                serviceItem.innerHTML = `
                    <div class="service-item-details">
                        <h4>${service.name} (${service.frequency})</h4>
                        <p>${service.description}</p>
                    </div>
                    <div class="service-item-action">
                        <span class="price">₹${service.price}</span>
                        <button class="btn btn-primary">Select</button>
                    </div>
                `;
                modalServiceList.appendChild(serviceItem);
            });
        } else {
            modalServiceList.innerHTML = '<p>No recurring services available at this time.</p>';
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        modalServiceList.innerHTML = '<p>Could not load services.</p>';
    }
}

/**
 * Handles the booking cancellation process.
 * @param {number} bookingId The ID of the booking to cancel.
 */
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch('cancel_booking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ booking_id: bookingId })
        });

        const result = await response.json();

        if (result.success) {
            alert('Booking cancelled successfully.');
            fetchBookingHistory(); // Refresh the booking list
        } else {
            alert(`Failed to cancel booking: ${result.message}`);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('An error occurred while cancelling the booking.');
    }
}