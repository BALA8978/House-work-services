document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');

    const bookingDetailsEl = document.getElementById('booking-details');
    const itemSelectEl = document.getElementById('item-select');
    const addMaterialBtn = document.getElementById('add-material-btn');
    const jobMaterialsListEl = document.getElementById('job-materials-list');
    const requestItemForm = document.getElementById('request-item-form');

    if (!bookingId) {
        document.body.innerHTML = '<h1>Error: No booking ID provided.</h1><a href="../homepage/index.html">Go Back</a>';
        return;
    }

    // --- FETCH AND DISPLAY DATA ---

    async function fetchBookingDetails() {
        const response = await fetch(`get_job_details.php?booking_id=${bookingId}`);
        const result = await response.json();
        if (result.success) {
            const booking = result.data;
            bookingDetailsEl.innerHTML = `
                <h2>Job Details for Booking #${booking.booking_id}</h2>
                <p><strong>Customer:</strong> ${booking.customer_name}</p>
                <p><strong>Date:</strong> ${booking.booking_date}</p>
                <p><strong>Work Description:</strong> ${booking.work_description || 'N/A'}</p>
            `;
        } else {
            bookingDetailsEl.innerHTML = `<p class="error">${result.message}</p>`;
        }
    }

    async function fetchAvailableInventory() {
        const response = await fetch('get_available_stock.php');
        const result = await response.json();
        itemSelectEl.innerHTML = '<option value="">Select an item...</option>';
        if (result.success) {
            result.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.item_id;
                option.textContent = `${item.item_name} (${item.stock_unit})`;
                itemSelectEl.appendChild(option);
            });
        }
    }

    async function fetchJobMaterials() {
        const response = await fetch(`get_job_materials.php?booking_id=${bookingId}`);
        const result = await response.json();
        jobMaterialsListEl.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(material => {
                const li = document.createElement('li');
                li.textContent = `${material.quantity_used} x ${material.item_name}`;
                jobMaterialsListEl.appendChild(li);
            });
        } else {
            jobMaterialsListEl.innerHTML = '<li>No materials added to this job yet.</li>';
        }
    }

    // --- EVENT LISTENERS AND ACTIONS ---

    addMaterialBtn.addEventListener('click', async () => {
        const itemId = itemSelectEl.value;
        const quantity = document.getElementById('item-quantity').value;
        const feedbackEl = document.getElementById('materials-feedback');

        if (!itemId || quantity <= 0) {
            feedbackEl.textContent = 'Please select an item and enter a valid quantity.';
            feedbackEl.className = 'feedback error';
            return;
        }

        const response = await fetch('add_material_to_job.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_id: parseInt(bookingId),
                item_id: parseInt(itemId),
                quantity: parseInt(quantity)
            })
        });
        const result = await response.json();

        feedbackEl.textContent = result.message;
        feedbackEl.className = result.success ? 'feedback success' : 'feedback error';

        if (result.success) {
            fetchJobMaterials();
        }
    });

    requestItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackEl = document.getElementById('request-feedback');
        const formData = new FormData(requestItemForm);

        const response = await fetch('request_new_item.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        feedbackEl.textContent = result.message;
        feedbackEl.className = result.success ? 'feedback success' : 'feedback error';

        if (result.success) {
            requestItemForm.reset();
        }
    });

    // --- INITIAL LOAD ---
    fetchBookingDetails();
    fetchAvailableInventory();
    fetchJobMaterials();
});