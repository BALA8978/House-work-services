document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');

    const amountDueEl = document.getElementById('amount-due');
    const payBtn = document.getElementById('pay-btn');
    const statusMessageEl = document.getElementById('payment-status');
    const paymentMethods = document.querySelectorAll('.method');
    const cardForm = document.getElementById('card-payment-form');

    if (!amountDueEl || !payBtn || !statusMessageEl || !cardForm) {
        console.error('Required payment elements not found on this page.');
        return;
    }

    let selectedMethod = 'upi';

    async function fetchPaymentDetails() {
        if (!paymentId) {
            amountDueEl.textContent = 'Invalid Link';
            statusMessageEl.textContent = 'No payment ID provided.';
            payBtn.disabled = true;
            payBtn.textContent = 'Invalid Payment';
            return;
        }
        try {
            const response = await fetch(`get_payment_details.php?payment_id=${paymentId}`);
            const result = await response.json();

            if (result.success && result.data) {
                amountDueEl.textContent = `₹${result.data.amount}`;
                // CORRECTED KEY: 'status' instead of 'payment_status'
                if (result.data.status === 'Paid') {
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
                // EXPLICITLY DISABLE BUTTON ON ERROR
                payBtn.disabled = true;
                payBtn.textContent = 'Payment Not Found';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            statusMessageEl.textContent = 'An error occurred while fetching details.';
            // EXPLICITLY DISABLE BUTTON ON ERROR
            payBtn.disabled = true;
            payBtn.textContent = 'Error';
        }
    }

    function validateCardDetails() {
        const cardNumber = document.getElementById('card-number').value;
        const cardHolder = document.getElementById('card-holder').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;

        if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardNumber)) {
            alert('Please enter a valid 16-digit card number.'); return false;
        }
        if (cardHolder.trim().length < 3) {
            alert("Please enter the cardholder's full name."); return false;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            alert('Please enter a valid expiry date in MM/YY format.'); return false;
        }
        if (!/^\d{3}$/.test(cvv)) {
            alert('Please enter a valid 3-digit CVV.'); return false;
        }
        return true;
    }

    async function processPayment() {
        if (selectedMethod === 'card' && !validateCardDetails()) return;

        payBtn.disabled = true;
        payBtn.textContent = 'Processing...';
        statusMessageEl.textContent = '';

        try {
            const response = await fetch('process_payment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_id: paymentId, payment_method: selectedMethod })
            });
            const result = await response.json();

            if (result.success) {
                statusMessageEl.style.color = 'var(--success-color)';
                statusMessageEl.innerHTML = `<i class="fas fa-check-circle"></i> Payment Successful! Redirecting...`;
                setTimeout(() => { window.location.href = 'index.html'; }, 3000);
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
            cardForm.classList.toggle('hidden', selectedMethod !== 'card');
        });
    });

    payBtn.addEventListener('click', processPayment);

    document.getElementById('card-number').addEventListener('input', e => {
        e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
    });
    document.getElementById('expiry-date').addEventListener('input', e => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
        e.target.value = value;
    });

    fetchPaymentDetails();
});

