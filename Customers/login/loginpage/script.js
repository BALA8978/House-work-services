document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('login-message');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageDiv.textContent = 'Logging in...';
            messageDiv.style.color = 'blue';
            submitButton.disabled = true;

            const formData = new FormData(loginForm);
            try {
                const response = await fetch('login.php', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (result.success) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = result.message;
                    // Redirect to the dashboard homepage
                    window.location.href = '../../Dashbord/homepage/index.html';
                } else {
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = result.message;
                    submitButton.disabled = false;
                }
            } catch (error) {
                console.error('Login error:', error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'An error occurred. Please try again.';
                submitButton.disabled = false;
            }
        });
    }
});
