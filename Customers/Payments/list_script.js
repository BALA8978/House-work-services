document.addEventListener('DOMContentLoaded', function() {
    const pendingList = document.getElementById('pending-payments-list');
    const historyList = document.getElementById('payment-history-list');

    async function fetchPayments() {
        // Ensure the elements exist before trying to modify them
        if (!pendingList || !historyList) {
            console.error('Required list elements are not found on this page.');
            return;
        }

        pendingList.innerHTML = '<p>Loading pending payments...</p>';
        historyList.innerHTML = '<p>Loading payment history...</p>';

        try {
            const response = await fetch('get_payments.php');
            const result = await response.json();

            if (result.success) {
                pendingList.innerHTML = '';
                historyList.innerHTML = '';

                const pendingPayments = result.data.filter(p => p.payment_status === 'Pending');
                const paidPayments = result.data.filter(p => p.payment_status === 'Paid');

                if (pendingPayments.length > 0) {
                    pendingPayments.forEach(payment => pendingList.appendChild(createPaymentCard(payment, true)));
                } else {
                    pendingList.innerHTML = '<p>No pending payments found.</p>';
                }

                if (paidPayments.length > 0) {
                    paidPayments.forEach(payment => historyList.appendChild(createPaymentCard(payment, false)));
                } else {
                    historyList.innerHTML = '<p>No payment history found.</p>';
                }
            } else {
                pendingList.innerHTML = `<p>Error: ${result.message}</p>`;
                historyList.innerHTML = `<p>Error: ${result.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            pendingList.innerHTML = '<p>Could not load payments due to a network error.</p>';
            historyList.innerHTML = '<p>Could not load payment history due to a network error.</p>';
        }
    }

    function createPaymentCard(payment, isPending) {
        const card = document.createElement('div');
        card.className = 'payment-card';
        const actionsHtml = isPending
            ? `<div class="payment-actions"><button class="btn-pay-small" onclick="payNow(${payment.payment_id})">Pay Now</button></div>`
            : '';

        card.innerHTML = `
            <div class="payment-details">
                <h3>Service with ${payment.technician_name}</h3>
                <p><strong>Booking Date:</strong> ${payment.booking_date}</p>
                <p><strong>Amount:</strong> ₹${payment.amount}</p>
                <p><strong>Status:</strong> <span class="payment-status ${payment.payment_status}">${payment.payment_status}</span></p>
            </div>
            ${actionsHtml}`;
        return card;
    }

    fetchPayments();
});

function payNow(paymentId) {
    window.location.href = `pay.html?payment_id=${paymentId}`;
}