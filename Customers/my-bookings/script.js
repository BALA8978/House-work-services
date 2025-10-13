document.addEventListener('DOMContentLoaded', function() {
    // --- INITIAL DATA FETCH ---
    fetchBookingHistory();
    fetchRecurringServices();

    // --- MODAL ELEMENTS & EVENT LISTENERS ---
    const addNewServiceBtn = document.getElementById('add-new-service-btn');
    const addServiceModal = document.getElementById('add-service-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModal = document.getElementById('cancellation-modal');
    const closeCancelModalBtn = document.getElementById('close-cancel-modal-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const manageModal = document.getElementById('manage-recurring-modal');
    const closeManageModalBtn = document.getElementById('close-manage-modal-btn');

    // --- ADD SERVICE MODAL LOGIC ---
    if (addNewServiceBtn) addNewServiceBtn.addEventListener('click', openAddServiceModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddServiceModal);

    // --- CANCELLATION MODAL LOGIC ---
    if (closeCancelModalBtn) closeCancelModalBtn.addEventListener('click', closeCancellationModal);
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => {
        const bookingId = confirmCancelBtn.dataset.bookingId;
        const reason = document.getElementById('cancellation-reason').value;
        if (!reason.trim()) return alert('Please provide a reason for cancellation.');
        cancelBooking(bookingId, reason);
    });

    // --- MANAGE RECURRING MODAL LOGIC ---
    if (closeManageModalBtn) closeManageModalBtn.addEventListener('click', closeManageRecurringModal);

    // Close modals on outside click
    window.addEventListener('click', function(event) {
        if (event.target === addServiceModal) closeAddServiceModal();
        if (event.target === cancelModal) closeCancellationModal();
        if (event.target === manageModal) closeManageRecurringModal();
    });
});

// --- DATA FETCHING AND RENDERING ---

async function fetchBookingHistory() {
    const historyList = document.getElementById('booking-history-list');
    if (!historyList) return;

    try {
        const response = await fetch('get_booking_history.php');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            historyList.innerHTML = '';
            result.data.forEach(booking => {
                const bookingCard = document.createElement('div');
                bookingCard.className = 'booking-card';
                const statusClass = booking.display_status.toLowerCase().replace(/ /g, '-');
                let actionButtonsHtml = '';

                // Logic to determine which buttons to show for each booking status
                if (booking.display_status === 'Technician Rejected') {
                    actionButtonsHtml = `<p class="rejection-note">The technician was unable to take this job.</p>
                        <button class="btn btn-card-action btn-approve-rejection" onclick="handleRejectionApproval(${booking.booking_id})"><i class="fas fa-search"></i> Find New Technician</button>
                        <button class="btn btn-card-action btn-cancel" onclick="openCancellationModal(${booking.booking_id})"><i class="fas fa-times"></i> Cancel Booking</button>`;
                } else if (booking.display_status === 'Searching for Technician') {
                    actionButtonsHtml = `<button class="btn btn-card-action btn-cancel" onclick="openCancellationModal(${booking.booking_id})"><i class="fas fa-times"></i> Cancel Search</button>`;
                } else if (['Upcoming', 'Pending Confirmation'].includes(booking.display_status)) {
                    actionButtonsHtml += `<button class="btn btn-card-action" onclick="window.location.href='../contact/contact.html?technician=${encodeURIComponent(booking.technician_name)}'"><i class="fas fa-phone"></i> Contact</button>`;
                    actionButtonsHtml += `<button class="btn btn-card-action" onclick="window.location.href='../tracking/index.html?technician=${encodeURIComponent(booking.technician_name)}'"><i class="fas fa-map-marker-alt"></i> Live Track</button>`;
                    actionButtonsHtml += `<button class="btn btn-card-action btn-cancel" onclick="openCancellationModal(${booking.booking_id})"><i class="fas fa-times"></i> Cancel</button>`;
                } else if (booking.display_status === 'Completed') {
                    actionButtonsHtml += `<button class="btn btn-card-action" onclick="location.href='../reviews/index.html?booking_id=${booking.booking_id}'"><i class="fas fa-star"></i> Review</button>`;
                    actionButtonsHtml += `<button class="btn btn-card-action" onclick="location.href='../warranty/index.html?booking_id=${booking.booking_id}'"><i class="fas fa-shield-alt"></i> File a Claim</button>`;
                }

                bookingCard.innerHTML = `
                    <div class="booking-details">
                        <h3>Service with ${booking.technician_name || 'TBD'}</h3>
                        <p><strong>Date:</strong> ${booking.booking_date}</p><p><strong>Time:</strong> ${booking.booking_time}</p>
                        <p><strong>Booking Status:</strong> <span class="booking-status ${statusClass}">${booking.display_status}</span></p>
                        <p><strong>Payment Status:</strong> <span class="payment-status ${booking.payment_status ? booking.payment_status.toLowerCase() : 'not-applicable'}">${booking.payment_status || 'N/A'}</span></p>
                    </div>
                    <div class="booking-actions">${actionButtonsHtml}</div>`;
                historyList.appendChild(bookingCard);
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
    if (!recurringList) return;
    try {
        const response = await fetch('get_recurring_services.php');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            recurringList.innerHTML = '';
            result.data.forEach(service => {
                const card = document.createElement('div');
                card.className = 'recurring-card';
                card.innerHTML = `<div class="recurring-details">
                        <h3>${service.service_description}</h3>
                        <p><strong>Frequency:</strong> ${service.frequency}</p>
                        <p><strong>Next Service Date:</strong> ${service.next_service_date}</p>
                        <p><strong>Status:</strong> ${service.status}</p>
                    </div>
                    <div class="recurring-actions">
                        <button class="btn" onclick="openManageRecurringModal(
                            '${service.recurring_booking_id}', 
                            '${service.service_description}', 
                            '${service.next_service_date}', 
                            '${service.status}'
                        )">Manage</button>
                    </div>`;
                recurringList.appendChild(card);
            });
        } else {
            recurringList.innerHTML = '<p>No recurring services found.</p>';
        }
    } catch (error) {
        console.error('Error fetching recurring services:', error);
        recurringList.innerHTML = '<p>Could not load recurring services.</p>';
    }
}

// --- ACTION HANDLER FUNCTIONS ---

async function handleRejectionApproval(bookingId) {
    if (!confirm("This will make your job available to all other technicians. Are you sure?")) return;
    try {
        const response = await fetch('handle_rejection_approval.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId, approved: true })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) fetchBookingHistory();
    } catch (error) {
        console.error('Error handling approval:', error);
        alert('An error occurred.');
    }
}

async function cancelBooking(bookingId, reason) {
    try {
        const response = await fetch('cancel_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId, reason: reason })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            closeCancellationModal();
            fetchBookingHistory();
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('An error occurred.');
    }
}

async function addRecurringService(serviceId) {
    if (!confirm('Are you sure you want to add this recurring service?')) return;
    try {
        const response = await fetch('add_recurring_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service_id: serviceId })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            closeAddServiceModal();
            fetchRecurringServices();
        }
    } catch (error) {
        console.error('Error adding recurring service:', error);
        alert('An error occurred.');
    }
}

async function updateRecurringStatus(bookingId, action) {
    const confirmMessage = `Are you sure you want to ${action} this service?`;
    if (!confirm(confirmMessage)) return;

    try {
        const response = await fetch('manage_recurring_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recurring_booking_id: bookingId, action: action })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            closeManageRecurringModal();
            fetchRecurringServices();
        }
    } catch (error) {
        console.error('Error updating recurring status:', error);
        alert('An error occurred. Please try again.');
    }
}

// --- MODAL CONTROL FUNCTIONS ---

function openCancellationModal(bookingId) {
    const cancelModal = document.getElementById('cancellation-modal');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    if (cancelModal && confirmCancelBtn) {
        confirmCancelBtn.dataset.bookingId = bookingId;
        cancelModal.style.display = 'flex';
    }
}

function closeCancellationModal() {
    const cancelModal = document.getElementById('cancellation-modal');
    if (cancelModal) cancelModal.style.display = 'none';
    const reasonTextarea = document.getElementById('cancellation-reason');
    if (reasonTextarea) reasonTextarea.value = '';
}

function openAddServiceModal() {
    const addServiceModal = document.getElementById('add-service-modal');
    if (addServiceModal) addServiceModal.style.display = 'flex';
    loadAvailableServices();
}

function closeAddServiceModal() {
    const addServiceModal = document.getElementById('add-service-modal');
    if (addServiceModal) addServiceModal.style.display = 'none';
}

function openManageRecurringModal(bookingId, serviceName, nextDate, status) {
    const modal = document.getElementById('manage-recurring-modal');
    document.getElementById('manage-modal-title').textContent = `Manage: ${serviceName}`;
    document.getElementById('manage-modal-next-date').textContent = nextDate;
    const statusSpan = document.getElementById('manage-modal-status');
    statusSpan.textContent = status;
    statusSpan.className = status.toLowerCase();

    const actionsContainer = document.getElementById('manage-modal-actions');
    actionsContainer.innerHTML = ''; // Clear old buttons

    if (status === 'Active') {
        actionsContainer.innerHTML += `<button class="btn btn-pause" onclick="updateRecurringStatus(${bookingId}, 'pause')">Pause Subscription</button>`;
    }
    if (status === 'Paused') {
        actionsContainer.innerHTML += `<button class="btn btn-resume" onclick="updateRecurringStatus(${bookingId}, 'resume')">Resume Subscription</button>`;
    }
    if (status !== 'Cancelled') {
        actionsContainer.innerHTML += `<button class="btn btn-cancel-subscription" onclick="updateRecurringStatus(${bookingId}, 'cancel')">Cancel Subscription</button>`;
    }

    if (modal) modal.style.display = 'flex';
}

function closeManageRecurringModal() {
    const modal = document.getElementById('manage-recurring-modal');
    if (modal) modal.style.display = 'none';
}

async function loadAvailableServices() {
    const modalServiceList = document.getElementById('modal-service-list');
    modalServiceList.innerHTML = '<p>Loading available services...</p>';
    try {
        const response = await fetch('get_weekly_monthly_services.php');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            modalServiceList.innerHTML = '';
            result.data.forEach(service => {
                const item = document.createElement('div');
                item.className = 'service-item';
                item.innerHTML = `<div class="service-item-details">
                        <h4>${service.name} (${service.frequency})</h4>
                        <p>${service.description}</p>
                    </div>
                    <div class="service-item-action">
                        <span class="price">₹${service.price}</span>
                        <button class="btn" onclick="addRecurringService(${service.service_id})">Select</button>
                    </div>`;
                modalServiceList.appendChild(item);
            });
        } else {
            modalServiceList.innerHTML = '<p>No recurring services available.</p>';
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        modalServiceList.innerHTML = '<p>Could not load services.</p>';
    }
}