document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');

    const amountDueEl = document.getElementById('amount-due');
    const payBtn = document.getElementById('pay-btn');
    const statusMessageEl = document.getElementById('payment-status');
    const paymentMethods = document.querySelectorAll('.method');

    // Ensure all required elements exist on this page
    if (!amountDueEl || !payBtn || !statusMessageEl) {
        console.error('Required payment elements not found on this page.');
        return;
    }

    let selectedMethod = 'upi'; // Default selection

    async function fetchPaymentDetails() {
        if (!paymentId) {
            amountDueEl.textContent = 'Invalid Link';
            statusMessageEl.textContent = 'No payment ID provided.';
            return;
        }
        try {
            const response = await fetch(`get_payment_details.php?payment_id=${paymentId}`);
            const result = await response.json();

            if (result.success && result.data) {
                amountDueEl.textContent = `₹${result.data.amount}`;
                if (result.data.payment_status === 'Paid') {
                    statusMessageEl.textContent = 'This payment has already been completed.';
                    statusMessageEl.style.color = 'var(--success-color)';
                    payBtn.disabled = true;
                    payBtn.textContent = 'Already Paid';
                } else {
                    payBtn.disabled = false;
                }
            } else {
                amountDueEl.textContent = 'Error';
                statusMessageEl.textContent = result.message || 'Could not retrieve payment details.';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            statusMessageEl.textContent = 'An error occurred while fetching details.';
        }
    }

    async function processPayment() {
        payBtn.disabled = true;
        payBtn.textContent = 'Processing...';
        statusMessageEl.textContent = '';

        try {
            const response = await fetch('process_payment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: paymentId,
                    payment_method: selectedMethod
                })
            });
            const result = await response.json();

            if (result.success) {
                statusMessageEl.style.color = 'var(--success-color)';
                statusMessageEl.innerHTML = `<i class="fas fa-check-circle"></i> Payment Successful! Redirecting...`;
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect back to payments list
                }, 3000);
            } else {
                statusMessageEl.style.color = 'red';
                statusMessageEl.textContent = `Payment Failed: ${result.message}`;
                payBtn.disabled = false;
                payBtn.textContent = 'Pay Now';
            }
        } catch (error) {
            console.error('Process error:', error);
            statusMessageEl.textContent = 'Payment failed due to a network error.';
            payBtn.disabled = false;
        }
    }

    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            selectedMethod = method.dataset.method;
        });
    });

    payBtn.addEventListener('click', processPayment);

    fetchPaymentDetails();
});