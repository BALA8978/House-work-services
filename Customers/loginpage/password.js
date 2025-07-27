function handleForgotPassword() {
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message");

  if (!email) {
    message.textContent = "Please enter your email address.";
    message.style.color = "red";
    return false;
  }

  // Simulate sending a reset link
  message.textContent = "If an account with that email exists, a password reset link has been sent.";
  message.style.color = "green";

  // Prevent form submission
  return false;
}