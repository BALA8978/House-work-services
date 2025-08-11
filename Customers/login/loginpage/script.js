document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const loginMessage = document.getElementById('login-message');

    // Clear previous messages and set to a default state
    if (loginMessage) {
        loginMessage.textContent = '';
        loginMessage.style.color = '#555';
    }

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (loginMessage) {
            loginMessage.textContent = data.message;
            if (data.success) {
                loginMessage.style.color = 'green';
                // Check for a redirect URL from the PHP response
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                loginMessage.style.color = 'red';
            }
        }
    })
    .catch(error => {
        if (loginMessage) {
            loginMessage.textContent = 'An error occurred. Please try again.';
            loginMessage.style.color = 'red';
        }
        console.error('Fetch Error:', error);
    });
});
