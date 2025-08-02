/**
 * File: /Registration/script.js
 *
 * This script handles the user interaction on the registration page.
 * It includes functions for role selection and form submission with validation.
 */

// --- Event Listener for DOMContentLoaded ---
// Ensures the script runs only after the entire HTML document has been loaded.
document.addEventListener('DOMContentLoaded', () => {
  // --- Role Selection Buttons ---
  const customerBtn = document.getElementById('customerBtn');
  const technicianBtn = document.getElementById('technicianBtn');

  if (customerBtn) {
    customerBtn.addEventListener('click', () => selectRole('customer'));
  }
  if (technicianBtn) {
    technicianBtn.addEventListener('click', () => selectRole('technician'));
  }

  // --- Form Submission ---
  // Get the form element from the page.
  const signupForm = document.querySelector('#signupForm form');

  if (signupForm) {
    // Add a 'submit' event listener to the form.
    signupForm.addEventListener('submit', (event) => {
      // Prevent the default browser action of submitting the form,
      // so we can handle it with our own code.
      event.preventDefault();

      // Perform validation before submitting.
      if (validatePassword()) {
        // If validation passes, call the function to submit the form data.
        submitRegistrationForm(signupForm);
      }
    });
  }
});

/**
 * Handles the visual selection of a user role ('customer' or 'technician').
 * @param {string} role - The role selected by the user.
 */
function selectRole(role) {
  const signupFormContainer = document.getElementById('signupForm');
  const customerBtn = document.getElementById('customerBtn');
  const technicianBtn = document.getElementById('technicianBtn');
  const roleInput = document.getElementById('roleInput');

  // Show the registration form.
  signupFormContainer.style.display = 'block';

  // Reset button styles.
  customerBtn.classList.remove('selected', 'inactive');
  technicianBtn.classList.remove('selected', 'inactive');

  // Apply 'selected' and 'inactive' classes based on the chosen role.
  if (role === 'customer') {
    customerBtn.classList.add('selected');
    technicianBtn.classList.add('inactive');
  } else {
    technicianBtn.classList.add('selected');
    customerBtn.classList.add('inactive');
  }

  // Set the value of the hidden input field for the role.
  roleInput.value = role;
}

/**
 * Validates the password field based on a set of rules.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
function validatePassword() {
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("passwordError");

  // Define password complexity rules.
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const minLength = password.length >= 8;

  // Check if all rules are met.
  if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    errorDiv.textContent =
      "Password must be 8+ characters and include uppercase, lowercase, number, and special characters.";
    return false; // Validation failed.
  }

  // If validation passes, clear any previous error messages.
  errorDiv.textContent = "";
  return true; // Validation succeeded.
}

/**
 * Submits the registration form data to the server using the Fetch API.
 * @param {HTMLFormElement} form - The form element to be submitted.
 */
async function submitRegistrationForm(form) {
  const formData = new FormData(form);
  const action = form.getAttribute('action');

  try {
    const response = await fetch(action, {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();

    // Redirect to login page after successful submission
    window.location.href = '../loginpage/index.html';

  } catch (error) {
    console.error('Error submitting the form:', error);
    alert('An error occurred. Please try again.');
  }
}
