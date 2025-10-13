document.getElementById('application-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const formData = new FormData(form);
    const message = document.getElementById('message');

    // Clear previous messages and hide it
    message.textContent = '';
    message.className = 'message'; // Reset classes
    message.style.display = 'none'; // Explicitly hide

    // Disable the submit button to prevent multiple submissions
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    fetch('apply.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Check if the response is OK (status 200-299)
        if (!response.ok) {
            // If not OK, try to read as text to get potential PHP errors
            return response.text().then(text => {
                throw new Error(`Server error: ${response.status} ${response.statusText} - ${text}`);
            });
        }
        // If OK, parse as JSON
        return response.json();
    })
    .then(data => {
        if (data.success) {
            message.textContent = 'Application submitted successfully! You will be notified once it is reviewed.';
            message.className = 'message success';
            form.reset(); // Clear the form on success
        } else {
            message.textContent = data.message || 'An unknown error occurred on the server.';
            message.className = 'message error';
        }
        message.style.display = 'block'; // Show the message
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        message.textContent = `An error occurred: ${error.message || 'Please try again.'}`;
        message.className = 'message error';
        message.style.display = 'block'; // Show the message
    })
    .finally(() => {
        // Re-enable the button regardless of success or failure
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
    });
});
