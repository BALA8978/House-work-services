const name = localStorage.getItem("customerName") || "Guest";
    const email = localStorage.getItem("customerEmail") || "guest@example.com";
    const gender = localStorage.getItem("customerGender") || "female";

    document.getElementById("userName").innerText = name;
    document.getElementById("userEmail").innerText = email;
    document.getElementById("avatarImg").src = gender === "male"
      ? "../Photos/male.png"
      : "../Photos/female.png";
    document.getElementById("genderSelect").value = gender;

    function showTab(tabId) {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      document.querySelector(`.tab[onclick*='${tabId}']`).classList.add("active");
      document.getElementById(tabId).classList.add("active");
    }

    document.getElementById("genderSelect").addEventListener("change", function () {
      const selectedGender = this.value;
      document.getElementById("avatarImg").src = selectedGender === "male"
        ? "../Photos/male.png"
        : "../Photos/female.png";
      localStorage.setItem("customerGender", selectedGender);
    });

    function validateForm() {
      const phone = document.getElementById("phone").value.trim();
      const city = document.getElementById("city").value.trim();
      const state = document.getElementById("state").value.trim();

      if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must be 10 digits.");
        return false;
      }

      if (city === "") {
        alert("City cannot be empty.");
        return false;
      }

      if (state === "") {
        alert("State cannot be empty.");
        return false;
      }

      alert("Profile saved successfully!");
      return true;
    }