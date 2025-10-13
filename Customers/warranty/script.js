document.addEventListener('DOMContentLoaded', () => {
    const warrantyForm = document.getElementById('warranty-form');
    const bookingIdInput = document.getElementById('booking_id');

    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    if (bookingId) {
        bookingIdInput.value = bookingId;
    }

    warrantyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(warrantyForm);

        try {
            const response = await fetch('submit_warranty_claim.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                window.location.href = '../my-bookings/index.html';
            }
        } catch (error) {
            console.error('Error submitting claim:', error);
            alert('An error occurred. Please try again.');
        }
    });
});