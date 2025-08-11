// Replace the entire contents of Registration/script.js with this code.

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const messageArea = document.getElementById('register-message');

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(registerForm);
        const selectedRole = formData.get('role'); // Get the selected role

        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        fetch('register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            messageArea.textContent = data.message;

            if (data.success) {
                messageArea.className = 'success';
                registerForm.reset();

                // --- MODIFIED: Conditional Redirection Logic ---
                setTimeout(() => {
                    if (data.role === 'technician') {
                        // If the user is a technician, redirect DIRECTLY to the apply page.
                        // Use an absolute path for reliability.
                        window.location.href = '/House-work-services/Technician/apply/index.html';
                    } else {
                        // If the user is a customer, redirect to the login page.
                        window.location.href = '../loginpage/index.html';
                    }
                }, 2000); // 2-second delay for the user to read the message

            } else {
                messageArea.className = 'error';
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
            }
        })
        .catch(error => {
            messageArea.className = 'error';
            messageArea.textContent = 'An error occurred. Please try again.';
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        });
    });
});