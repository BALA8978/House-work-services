document.addEventListener('DOMContentLoaded', function() {
    const resolveModal = document.getElementById('resolve-job-modal');
    const resolveForm = document.getElementById('resolve-job-form');
    const resolveBookingIdInput = document.getElementById('resolve-booking-id');

    // --- MODIFIED: Add a global function to open the resolve modal ---
    window.openResolveModal = function(bookingId) {
        if (resolveModal && resolveBookingIdInput) {
            resolveBookingIdInput.value = bookingId;
            resolveModal.classList.remove('hidden');
        }
    }
    // --- MODIFIED: Add a global function to close the resolve modal ---
    window.closeResolveModal = function() {
        if (resolveModal) {
            resolveModal.classList.add('hidden');
            resolveForm.reset();
        }
    }

    async function fetchJobs(status) {
        const listIdMap = {
            'pending': 'jobs-list',
            'accepted': 'accepted-jobs-list',
            'rejected': 'rejected-jobs-list',
            'open': 'open-jobs-list'
        };
        const listId = listIdMap[status];
        const jobsList = document.getElementById(listId);
        if (!jobsList) return;

        jobsList.innerHTML = '<p>Loading jobs...</p>';
        try {
            let endpoint = `../jobs/get_${status}_jobs.php`;
            if (status === 'pending') {
                endpoint = '../jobs/get_jobs.php';
            }

            const response = await fetch(endpoint);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                jobsList.innerHTML = '';
                result.data.forEach(job => {
                    const jobCard = document.createElement('div');
                    jobCard.className = 'job-card';

                    const addressParts = [job.address, job.city, job.pincode].filter(Boolean);
                    const fullAddress = addressParts.join(', ') || 'Address not provided';

                    let actionsHtml = '';
                    if (status === 'pending') {
                         actionsHtml = `<div class="actions">
                                <input type="text" id="rejection-reason-${job.booking_id}" class="rejection-reason-input" placeholder="Reason for rejection (optional)">
                                <div style="display: flex; gap: 10px;">
                                    <button class="accept" onclick="updateJobStatus(${job.booking_id}, 'Accepted')">Accept</button>
                                    <button class="reject" onclick="updateJobStatus(${job.booking_id}, 'Rejected')">Reject</button>
                                </div>
                            </div>`;
                    } else if (status === 'accepted') {
                        actionsHtml = `<div class="actions">
                            <button class="action-btn" onclick="window.open('../tracking/index.html?customer_name=${encodeURIComponent(job.customer_name)}&address=${encodeURIComponent(fullAddress)}', '_blank')"><i class="fas fa-route"></i> Track Route</button>
                            <button class="action-btn" onclick="window.open('../Inventory/index.html?booking_id=${job.booking_id}', '_blank')"><i class="fas fa-boxes"></i> Manage Inventory</button>
                            <button class="action-btn" onclick="alert('Contact feature coming soon!')"><i class="fas fa-phone"></i> Contact Customer</button>`;

                        // --- NEW LOGIC: Add Invoice button ONLY if job is completed ---
                        if (job.work_status === 'Completed' || job.work_status === 'Failed') {
                             actionsHtml += `<button class="action-btn" onclick="window.open('../jobs/invoice.php?booking_id=${job.booking_id}', '_blank')"><i class="fas fa-file-invoice"></i> View Invoice</button>`;
                        } else {
                             actionsHtml += `<button class="resolve" onclick="openResolveModal(${job.booking_id})">Resolve Job</button>`;
                        }
                        actionsHtml += `</div>`;

                    } else if (status === 'open') {
                        actionsHtml = `<div class="actions"><button class="claim" onclick="claimJob(${job.booking_id})">Claim Job</button></div>`;
                    }

                    // --- MODIFIED: Include work_status in the card for better context ---
                    const workStatusHtml = job.work_status && job.work_status !== 'Pending'
                        ? `<p><strong>Work Status:</strong> <span class="status ${job.work_status.toLowerCase()}">${job.work_status}</span></p>`
                        : '';

                    jobCard.innerHTML = `<div class="job-info">
                            <h3>Job ID: ${job.booking_id}</h3>
                            <p><strong>Customer:</strong> ${job.customer_name}</p>
                            <p><strong>Location:</strong> ${fullAddress}</p>
                            <p><strong>Date & Time:</strong> ${job.booking_date} at ${job.booking_time}</p>
                            <p><strong>Work:</strong> ${job.work_description || 'N/A'}</p>
                            ${job.payment_status ? `<p><strong>Payment:</strong> <span class="status ${job.payment_status.toLowerCase()}">${job.payment_status}</span></p>` : ''}
                            ${workStatusHtml}
                        </div>
                        ${actionsHtml}`;
                    jobsList.appendChild(jobCard);
                });
            } else {
                jobsList.innerHTML = `<p>No ${status} jobs found.</p>`;
            }
        } catch (error) {
            console.error(`Error fetching ${status} jobs:`, error);
            jobsList.innerHTML = `<p>Could not load ${status} jobs due to an error.</p>`;
        }
    }

    // --- MODIFIED: Add logic to `get_accepted_jobs.php` to include work_status ---
    // Make sure the PHP script `get_accepted_jobs.php` also selects `b.work_status`
    // I will add this to the PHP file content as a reminder.

    // --- The rest of the functions (updateJobStatus, claimJob, form submission) remain unchanged ---

    window.updateJobStatus = async function(bookingId, status) {
        const reasonInput = document.getElementById(`rejection-reason-${bookingId}`);
        const reason = reasonInput ? reasonInput.value : '';

        if (status === 'Rejected' && !reason.trim()) {
            alert('A reason is required to reject a job.');
            return;
        }

        try {
            const response = await fetch('../jobs/update_job_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingId, status: status, reason: reason })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchJobs('pending');
                fetchJobs('accepted');
                fetchJobs('rejected');
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            alert('An error occurred.');
        }
    };

    window.claimJob = async function(bookingId) {
        if (!confirm('Are you sure you want to claim this job?')) return;
        try {
            const response = await fetch('../jobs/claim_job.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingId })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchJobs('open');
                fetchJobs('accepted');
            }
        } catch (error) {
            console.error('Error claiming job:', error);
            alert('An error occurred.');
        }
    };

    if (resolveForm) {
        resolveForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(resolveForm);
            const submitButton = resolveForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                const response = await fetch('../jobs/resolve_job.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                alert(result.message);
                if (result.success) {
                    closeResolveModal();
                    fetchJobs('accepted'); // Refresh the accepted jobs list
                }
            } catch (error) {
                console.error('Error resolving job:', error);
                alert('An error occurred during submission.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Resolution';
            }
        });
    }


    fetchJobs('pending');
    fetchJobs('accepted');
    fetchJobs('open');
    fetchJobs('rejected');
});