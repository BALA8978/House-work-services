document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const payoutListEl = document.getElementById('payout-queue-list');
    const processBtn = document.getElementById('process-payout-btn');
    let selectedForPayout = [];

    async function fetchPendingPayouts() {
        try {
            const response = await fetch('get_pending_payouts.php');
            const result = await response.json();
            payoutListEl.innerHTML = '';
            if (result.success && result.data.length > 0) {
                result.data.forEach(item => {
                    const payoutDiv = document.createElement('div');
                    payoutDiv.className = 'payout-item';
                    payoutDiv.innerHTML = `
                        <input type="checkbox" class="payout-checkbox" data-history-id="${item.history_id}" data-amount="${item.amount}" data-tech-name="${item.technician_name}">
                        <div>
                            <p><strong>${item.technician_name}</strong></p>
                            <p>Booking ID: ${item.booking_id} | Amount: ₹${parseFloat(item.amount).toFixed(2)}</p>
                        </div>
                    `;
                    payoutListEl.appendChild(payoutDiv);
                });
            } else {
                payoutListEl.innerHTML = '<p>No jobs are currently awaiting payout.</p>';
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
            payoutListEl.innerHTML = '<p>Could not load data.</p>';
        }
    }

    payoutListEl.addEventListener('change', function(e) {
        if (e.target.classList.contains('payout-checkbox')) {
            const historyId = e.target.dataset.historyId;
            if (e.target.checked) {
                selectedForPayout.push({
                    history_id: historyId,
                    amount: e.target.dataset.amount,
                    technician_name: e.target.dataset.techName
                });
            } else {
                selectedForPayout = selectedForPayout.filter(p => p.history_id !== historyId);
            }
            processBtn.disabled = selectedForPayout.length === 0;
        }
    });

    processBtn.addEventListener('click', async function() {
        if (!confirm(`Are you sure you want to process payouts for ${selectedForPayout.length} item(s)?`)) return;

        try {
            const response = await fetch('process_payouts.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payouts: selectedForPayout })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                selectedForPayout = [];
                processBtn.disabled = true;
                fetchPendingPayouts();
            }
        } catch(error) {
            console.error('Error processing payouts:', error);
            alert('An error occurred while processing payouts.');
        }
    });

    fetchPendingPayouts();
});