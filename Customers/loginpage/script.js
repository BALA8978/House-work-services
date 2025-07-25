function validateLoginForm() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("loginError");

  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Reset the error message on each attempt
  error.textContent = "";

  // Validate the Email Field
  if (!email) {
    error.textContent = "Please enter your email address.";
    return false;
  }
  if (!emailRegex.test(email)) {
    error.textContent = "Please enter a valid email format (e.g., user@example.com).";
    return false;
  }

  // Validate the Password Field
  if (!password) {
    error.textContent = "Please enter your password.";
    return false;
  }
  if (password.length < 6) {
    error.textContent = "Password must be at least 6 characters long.";
    return false;
  }

  // If all checks pass, allow the form to be submitted
  return true;
}