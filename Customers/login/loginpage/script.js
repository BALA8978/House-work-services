document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
<<<<<<< HEAD
    const loginMessage = document.getElementById('login-message');

    // Clear previous messages and set to a default state
    if (loginMessage) {
        loginMessage.textContent = '';
        loginMessage.style.color = '#555';
    }

=======
    const errorMessage = document.getElementById('error-message');

>>>>>>> 5399952a04f177fdbfcba053448f54e50fca2b46
    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
<<<<<<< HEAD
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
=======
        if (data.success) {
            // Handle redirection based on the response from login.php
            if (data.user_type === 'customer') {
                window.location.href = '../Dashbord/index.html';
            } else if (data.user_type === 'technician') {
                switch (data.status) {
                    case 'approved':
                        window.location.href = '../../Technician/Dashboard/index.html';
                        break;
                    case 'pending':
                        errorMessage.textContent = 'Your application is still pending review. Please wait for admin approval.';
                        break;
                    case 'rejected':
                        errorMessage.textContent = 'We regret to inform you that your application has been rejected.';
                        break;
                    case 'not_applied':
                        // If registered but no application, send to application form
                        window.location.href = '../../Technician/apply/index.html';
                        break;
                    default:
                        errorMessage.textContent = 'An unknown error occurred. Please contact support.';
                }
            } else if (data.user_type === 'admin') {
                window.location.href = '../../Admin/Dashbord/index.html';
            }
        } else {
            errorMessage.textContent = data.message;
        }
    })
    .catch(error => {
        errorMessage.textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
>>>>>>> 5399952a04f177fdbfcba053448f54e50fca2b46
    });
});
