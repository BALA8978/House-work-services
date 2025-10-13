document.addEventListener('DOMContentLoaded', function() {
    async function fetchEarningsData() {
        const response = await fetch('get_earnings_data.php');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            // Populate summary cards
            document.getElementById('total-earned').textContent = `₹${parseFloat(data.summary.total_earned || 0).toFixed(2)}`;
            document.getElementById('last-payout').textContent = `₹${parseFloat(data.summary.last_payout || 0).toFixed(2)}`;
            document.getElementById('pending-payout').textContent = `₹${parseFloat(data.summary.pending_payout || 0).toFixed(2)}`;

            // Populate awaiting payout table
            const awaitingList = document.getElementById('awaiting-payout-list');
            if(data.awaiting_payout.length > 0) {
                let tableHtml = '<table><thead><tr><th>Completion Date</th><th>Amount</th></tr></thead><tbody>';
                data.awaiting_payout.forEach(item => {
                    tableHtml += `<tr><td>${item.booking_date}</td><td>₹${item.amount}</td></tr>`;
                });
                tableHtml += '</tbody></table>';
                awaitingList.innerHTML = tableHtml;
            } else {
                awaitingList.innerHTML = '<p>No jobs are currently awaiting payout.</p>';
            }

            // Populate payout history table
            const historyList = document.getElementById('payout-history-list');
            if(data.payout_history.length > 0) {
                let tableHtml = '<table><thead><tr><th>Payout Date</th><th>Amount</th><th>Reference ID</th></tr></thead><tbody>';
                data.payout_history.forEach(item => {
                    tableHtml += `<tr><td>${new Date(item.payout_date).toLocaleDateString()}</td><td>₹${item.amount}</td><td>${item.transaction_reference}</td></tr>`;
                });
                tableHtml += '</tbody></table>';
                historyList.innerHTML = tableHtml;
            } else {
                historyList.innerHTML = '<p>No payout history found.</p>';
            }
        }
    }
    fetchEarningsData();
});