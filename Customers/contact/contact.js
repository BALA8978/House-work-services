document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const statusMessage = document.getElementById('status-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;

            try {
                const response = await fetch('submit_support_ticket.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    statusMessage.textContent = result.message;
                    statusMessage.className = 'status-message success';
                    contactForm.reset();
                } else {
                    statusMessage.textContent = `Error: ${result.message}`;
                    statusMessage.className = 'status-message error';
                }
            } catch (error) {
                console.error('Submission error:', error);
                statusMessage.textContent = 'A network error occurred. Please try again.';
                statusMessage.className = 'status-message error';
            } finally {
                submitButton.textContent = 'Submit';
                submitButton.disabled = false;
            }
        });
    }
});