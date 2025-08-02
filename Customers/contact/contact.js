document.addEventListener('DOMContentLoaded', function() {

    // Pre-fill subject line if technician name is in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const technicianName = urlParams.get('technician');
    const subjectInput = document.getElementById('subject');

    if (technicianName && subjectInput) {
        subjectInput.value = `Question regarding service with ${technicianName}`;
    }

    // Handle form submission
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const statusDiv = document.getElementById('form-status');

        statusDiv.className = '';
        statusDiv.textContent = 'Sending...';
        statusDiv.style.display = 'block';

        fetch('submit_contact.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                statusDiv.textContent = data.message;
                statusDiv.className = 'success';
                form.reset();
                 if (technicianName && subjectInput) {
                    subjectInput.value = `Question regarding service with ${technicianName}`;
                }
            } else {
                statusDiv.textContent = data.message;
                statusDiv.className = 'error';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            statusDiv.textContent = 'An error occurred. Please try again later.';
            statusDiv.className = 'error';
        });
    });
});