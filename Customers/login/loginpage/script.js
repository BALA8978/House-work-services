document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const loginMessage = document.getElementById('login-message');
    const errorMessage = document.getElementById('error-message');

    // Clear previous messages
    if (loginMessage) {
        loginMessage.textContent = '';
        loginMessage.style.color = '#555';
    }
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.color = '#555';
    }

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (loginMessage) {
                loginMessage.textContent = data.message || 'Login successful!';
                loginMessage.style.color = 'green';
            }
            // Handle redirection based on the response from login.php
            if (data.redirect) {
                window.location.href = data.redirect;
            } else if (data.user_type === 'customer') {
                window.location.href = '../Dashbord/index.html';
            } else if (data.user_type === 'technician') {
                switch (data.status) {
                    case 'approved':
                        window.location.href = '../../Technician/Dashboard/index.html';
                        break;
                    case 'pending':
                        if (errorMessage) {
                            errorMessage.textContent = 'Your application is still pending review. Please wait for admin approval.';
                            errorMessage.style.color = 'red';
                        }
                        break;
                    case 'rejected':
                        if (errorMessage) {
                            errorMessage.textContent = 'We regret to inform you that your application has been rejected.';
                            errorMessage.style.color = 'red';
                        }
                        break;
                    case 'not_applied':
                        window.location.href = '../../Technician/apply/index.html';
                        break;
                    default:
                        if (errorMessage) {
                            errorMessage.textContent = 'An unknown error occurred. Please contact support.';
                            errorMessage.style.color = 'red';
                        }
                }
            } else if (data.user_type === 'admin') {
                window.location.href = '../../Admin/Dashbord/index.html';
            }
        } else {
            if (loginMessage) {
                loginMessage.textContent = data.message || 'Login failed.';
                loginMessage.style.color = 'red';
            }
            if (errorMessage) {
                errorMessage.textContent = data.message || 'Login failed.';
                errorMessage.style.color = 'red';
            }
        }
    })
    .catch(error => {
        if (loginMessage) {
            loginMessage.textContent = 'An error occurred. Please try again.';
            loginMessage.style.color = 'red';
        }
        if (errorMessage) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.color = 'red';
        }
        console.error('Fetch Error:', error);
    });
});
