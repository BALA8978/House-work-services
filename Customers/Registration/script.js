function selectRole(role) {
      document.getElementById('signupForm').style.display = 'block';

      const customerBtn = document.getElementById('customerBtn');
      const technicianBtn = document.getElementById('technicianBtn');
      // Reset both
  customerBtn.classList.remove('selected', 'inactive');
  technicianBtn.classList.remove('selected', 'inactive');

      if (role === 'customer') {
        customerBtn.classList.add('selected');
        technicianBtn.classList.add('inactive');
      } else {
        technicianBtn.classList.add('selected');
        customerBtn.classList.add('inactive');
      }
      document.getElementById('roleInput').value = role;
    }

    function validatePassword() {
      const password = document.getElementById("password").value;
      const errorDiv = document.getElementById("passwordError");

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const minLength = password.length >= 8;

      if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        errorDiv.textContent =
          "Password must be at least 8 characters, and include uppercase, lowercase, number, and special character.";
        return false;
      }

      errorDiv.textContent = "";
      return true;
     }