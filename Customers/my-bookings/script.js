document.addEventListener('DOMContentLoaded', function() {
    fetchBookingHistory();
    fetchRecurringServices();
    initializeButtonListeners();
});

async function fetchBookingHistory() {
    const historyList = document.getElementById('booking-history-list');
    try {
        const response = await fetch('get_booking_history.php');
        const bookings = await response.json();

        if (bookings.success && bookings.data.length > 0) {
            historyList.innerHTML = '';
            bookings.data.forEach(booking => {
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
                        <button class="btn btn-card-action"><i class="fas fa-user"></i> Profile</button>
                        <button class="btn btn-card-action"><i class="fas fa-map-marker-alt"></i> Live Track</button>
                    </div>
                `;
                historyList.appendChild(bookingCard);
            });

            // Add event listeners to the newly created contact buttons
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

function initializeButtonListeners() {
    const addNewServiceBtn = document.getElementById('add-new-service-btn');

    if (addNewServiceBtn) {
        addNewServiceBtn.addEventListener('click', () => {
            alert('Add New Service button clicked!');
        });
    }
}