/**
 * File: /loginpage/script.js
 *
 * This script handles the login form submission, providing clear feedback
 * to the user by communicating with the server.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    // Ensure messageDiv and submitButton are consistently accessed
    const messageDiv = document.getElementById('login-message');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Check if the login form exists before adding an event listener
    if (loginForm && messageDiv && submitButton) {
        loginForm.addEventListener('submit', async (event) => {
            // Prevent the default page reload on form submission
            event.preventDefault();

            const formData = new FormData(loginForm);
            const action = loginForm.getAttribute('action'); // Should be 'login.php'

            // Clear previous messages and styles
            messageDiv.textContent = '';
            messageDiv.style.color = '';

            // --- Add Loading Indicator ---
            messageDiv.textContent = 'Logging in...';
            messageDiv.style.color = 'blue'; // You could also add a loading spinner via CSS
            submitButton.disabled = true; // Disable button during submission
            // --- End Loading Indicator ---

            console.log("Attempting to fetch from:", action); // DEBUG: Log the target URL

            try {
                // Send the form data to the PHP script
                const response = await fetch(action, {
                    method: 'POST',
                    body: formData,
                });

                // Check for HTTP errors (e.g., 404, 500) before trying to parse JSON
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("HTTP Error Status:", response.status);
                    console.error("HTTP Error Response Body:", errorText);
                    throw new Error(`Server responded with status: ${response.status}. Check network tab.`);
                }

                // Get the JSON response from the server
                const result = await response.json();
                console.log("Server JSON response:", result); // DEBUG: Crucial for verifying server output

                if (result.success) {
                    console.log("Login successful! Displaying confirmation pop-up."); // DEBUG
                    // On success, display the success message using a pop-up
                    if (confirm(result.message + "\nClick OK to redirect to the main page.")) {
                        console.log("User clicked OK. Redirecting to dashboard.html."); // DEBUG
                        // If the user clicks "OK", redirect to the main page
                        window.location.href = "../../searching and fulttering/index.html"; // IMPORTANT: Update this path if 'dashboard.html' is in a different location
                    } else {
                        console.log("User clicked Cancel or closed the pop-up."); // DEBUG: Handle if user chooses not to redirect immediately
                        // Optionally, you might still show a success message on the page if they cancel redirection
                        messageDiv.style.color = 'green';
                        messageDiv.textContent = result.message + " You can navigate manually.";
                    }
                } else {
                    console.log("Login failed. Displaying error message on page."); // DEBUG
                    // On failure, display the error message in red
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = result.message;
                    // Clear password field on failure for security
                    const passwordInput = loginForm.querySelector('input[type="password"]');
                    if (passwordInput) {
                        passwordInput.value = '';
                    }
                }

            } catch (error) {
                // Handle network errors or issues with JSON parsing
                console.error('An error occurred during login process:', error); // DEBUG: More specific error logging
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'An error occurred. Please try again.';
            } finally {
                // --- Remove Loading Indicator ---
                // This 'finally' block ensures this runs regardless of success or failure
                submitButton.disabled = false; // Re-enable button
                // If you had a spinner, you'd hide it here
                // --- End Remove Loading Indicator ---
            }
        });
    } else {
        console.error("Login form, message div, or submit button not found. Check HTML IDs."); // DEBUG: Alert if elements are missing
    }
});