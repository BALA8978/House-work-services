document.addEventListener('DOMContentLoaded', function() {
    const requestsTbody = document.getElementById('requests-tbody');

    async function fetchOnboardingRequests() {
        try {
            const response = await fetch('get_onboarding_requests.php');
            const result = await response.json();

            requestsTbody.innerHTML = ''; // Clear existing rows
            if (result.success && result.data.length > 0) {
                result.data.forEach(request => {
                    const tr = document.createElement('tr');
                    
                    // Action buttons are only shown for 'pending' requests
                    const actionsHtml = request.status === 'pending' ?
                        `<div class="flex space-x-2">
                            <button class="action-btn approve-btn" data-id="${request.profile_id}">Approve</button>
                            <button class="action-btn reject-btn" data-id="${request.profile_id}">Reject</button>
                        </div>` :
                        'Processed';

                    // Make the document path a clickable link
                    const documentLink = request.documents_path ? 
                        `<a href="../Technician/apply/${request.documents_path}" target="_blank" class="document-link">View Document</a>` : 
                        'No Document';

                    tr.innerHTML = `
                        <td>${request.full_name}</td>
                        <td>${request.phone_number}</td>
                        <td>${request.skills}</td>
                        <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                        <td>${documentLink}</td>
                        <td>${actionsHtml}</td>
                    `;
                    requestsTbody.appendChild(tr);
                });
            } else {
                requestsTbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No onboarding requests found.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    }

    async function updateOnboardingStatus(profileId, newStatus) {
        try {
            const response = await fetch('update_onboarding_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile_id: profileId,
                    status: newStatus
                })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchOnboardingRequests(); // Refresh the list
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred. Please try again.");
        }
    }

    requestsTbody.addEventListener('click', function(e) {
        const profileId = e.target.getAttribute('data-id');
        if (!profileId) return;

        if (e.target.classList.contains('approve-btn')) {
            if (confirm(`Are you sure you want to approve this technician?`)) {
                updateOnboardingStatus(profileId, 'approved');
            }
        } else if (e.target.classList.contains('reject-btn')) {
            if (confirm(`Are you sure you want to reject this technician?`)) {
                updateOnboardingStatus(profileId, 'rejected');
            }
        }
    });

    // Initial load
    fetchOnboardingRequests();
});
