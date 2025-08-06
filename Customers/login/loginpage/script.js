document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const errorMessage = document.getElementById('error-message');

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
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
    });
});
