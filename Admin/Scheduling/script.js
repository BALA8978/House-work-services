document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const techSelect = document.getElementById('technician-select');
    const jobsContainer = document.getElementById('jobs-container');
    const addJobBtn = document.getElementById('add-job-btn');
    const form = document.getElementById('bulk-schedule-form');
    const feedbackEl = document.getElementById('schedule-feedback');
    let jobCounter = 0;

    async function populateDropdowns() {
        try {
            const response = await fetch('get_technicians_customers.php');
            const result = await response.json();
            if (result.success) {
                techSelect.innerHTML = '<option value="">Select Technician...</option>';
                result.data.technicians.forEach(tech => {
                    techSelect.innerHTML += `<option value="${tech.id}">${tech.name}</option>`;
                });
                window.customers = result.data.customers;
                addJobRow(); // Add the first job row
            }
        } catch(error) {
            console.error('Error populating dropdowns:', error);
        }
    }

    function createCustomerDropdown() {
        let options = '<option value="">Select Customer...</option>';
        if (window.customers) {
            window.customers.forEach(cust => {
                options += `<option value="${cust.id}">${cust.full_name}</option>`;
            });
        }
        return options;
    }

    function addJobRow() {
        jobCounter++;
        const jobRow = document.createElement('div');
        jobRow.className = 'job-row';
        jobRow.style = 'display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 1rem;';
        jobRow.innerHTML = `
            <div class="form-group">
                <label>Customer</label>
                <select name="jobs[${jobCounter}][user_id]" required>${createCustomerDropdown()}</select>
            </div>
            <div class="form-group">
                <label>Work Description</label>
                <input type="text" name="jobs[${jobCounter}][description]" required>
            </div>
        `;
        jobsContainer.appendChild(jobRow);
    }

    addJobBtn.addEventListener('click', addJobRow);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            const response = await fetch('process_bulk_schedule.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            feedbackEl.textContent = result.message;
            feedbackEl.className = result.success ? 'feedback success' : 'feedback error';
            if (result.success) {
                form.reset();
                jobsContainer.innerHTML = '';
                addJobRow(); // Add a fresh row
            }
        } catch (error) {
            console.error('Error submitting schedule:', error);
            feedbackEl.textContent = 'An unexpected error occurred.';
            feedbackEl.className = 'feedback error';
        }
    });

    populateDropdowns();
});