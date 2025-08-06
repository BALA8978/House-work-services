document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const errorMessage = document.getElementById('error-message');

    fetch('register.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to the application page after successful registration
            window.location.href = '../apply/index.html';
        } else {
            errorMessage.textContent = data.message;
        }
    })
    .catch(error => {
        errorMessage.textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    });
});
