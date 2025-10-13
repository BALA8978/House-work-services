document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const claimsList = document.getElementById('warranty-claims-list');

    async function fetchWarrantyClaims() {
        try {
            const response = await fetch('get_warranty_claims.php');
            const result = await response.json();

            claimsList.innerHTML = '';
            if (result.success && result.data.length > 0) {
                result.data.forEach(claim => {
                    const claimCard = document.createElement('div');
                    claimCard.className = 'card';
                    claimCard.innerHTML = `
                        <h2>${claim.subject}</h2>
                        <p><strong>Booking ID:</strong> ${claim.booking_id}</p>
                        <p><strong>Status:</strong> ${claim.status}</p>
                        <div class="mt-4">
                            <button onclick="updateStatus(${claim.claim_id}, 'Approved')" class="btn btn-approve">Approve</button>
                            <button onclick="updateStatus(${claim.claim_id}, 'Rejected')" class="btn btn-reject">Reject</button>
                        </div>
                    `;
                    claimsList.appendChild(claimCard);
                });
            } else {
                claimsList.innerHTML = '<div class="card"><p>No warranty claims found.</p></div>';
            }
        } catch (error) {
            console.error('Error fetching warranty claims:', error);
            claimsList.innerHTML = '<div class="card"><p>Could not load warranty claims.</p></div>';
        }
    }

    window.updateStatus = async function(claimId, status) {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this claim?`)) {
            return;
        }

        try {
            const response = await fetch('update_warranty_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim_id: claimId, status: status })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchWarrantyClaims(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating claim status:', error);
            alert('An error occurred while updating the claim status.');
        }
    }

    fetchWarrantyClaims();
});