document.addEventListener('DOMContentLoaded', function() {
    const pendingList = document.getElementById('pending-payments-list');
    const historyList = document.getElementById('payment-history-list');

    async function fetchPayments() {
        if (!pendingList || !historyList) return;

        pendingList.innerHTML = '<p>Loading pending payments...</p>';
        historyList.innerHTML = '<p>Loading payment history...</p>';

        try {
            const response = await fetch('get_payments.php');
            const result = await response.json();

            if (result.success) {
                pendingList.innerHTML = '';
                historyList.innerHTML = '';

                const pendingPayments = result.data.filter(p => p.payment_status === 'Pending');
                const historyPayments = result.data.filter(p => p.payment_status !== 'Pending');

                if (pendingPayments.length > 0) {
                    pendingPayments.forEach(payment => pendingList.appendChild(createPaymentCard(payment, true)));
                } else {
                    pendingList.innerHTML = '<p>No pending payments found.</p>';
                }

                if (historyPayments.length > 0) {
                    historyPayments.forEach(payment => historyList.appendChild(createPaymentCard(payment, false)));
                } else {
                    historyList.innerHTML = '<p>No payment history found.</p>';
                }
            } else {
                pendingList.innerHTML = `<p class="error-message">Error: ${result.message}</p>`;
                historyList.innerHTML = `<p class="error-message">Error: ${result.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            pendingList.innerHTML = '<p class="error-message">Could not load payments due to a network error.</p>';
            historyList.innerHTML = '<p class="error-message">Could not load payment history due to a network error.</p>';
        }
    }

    function createPaymentCard(payment, isPending) {
        const card = document.createElement('div');
        card.className = 'payment-card';
        
        const actionsHtml = isPending
            ? `<div class="payment-actions"><button class="btn-pay-small" onclick="payNow(${payment.payment_id})">Pay Now</button></div>`
            : '';
        
        // Handle potential null work_status
        const workStatus = payment.work_status || 'Pending';
        const workStatusClass = workStatus.replace(' ', '-');

        card.innerHTML = `
            <div class="payment-details">
                <h3>Service with ${payment.technician_name}</h3>
                <p><strong>Booking Date:</strong> ${payment.booking_date}</p>
                <p><strong>Amount:</strong> ₹${payment.amount}</p>
                <div class="status-container">
                    <span class="status-tag ${payment.payment_status}">${payment.payment_status}</span>
                    <span class="status-tag Work-${workStatusClass}">${workStatus}</span>
                </div>
            </div>
            ${actionsHtml}`;
        return card;
    }

    window.payNow = function(paymentId) {
        window.location.href = `pay.html?payment_id=${paymentId}`;
    }

    fetchPayments();
});
