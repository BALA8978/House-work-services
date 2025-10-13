// profile.js
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = '../login/homepage/index.html'; // Redirect to logout script
    }
}
document.addEventListener('DOMContentLoaded', function() {
    loadCustomerProfile(); // Load data when the page loads
    loadJobHistory();
});

function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector(`.tab[onclick*='${tabId}']`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
}

function loadJobHistory() {
    fetch('get_job_history.php')
        .then(response => {
            // Get the raw text from the response first
            return response.text().then(text => {
                try {
                    // Then, try to parse it as JSON
                    return JSON.parse(text);
                } catch (e) {
                    // If parsing fails, log the raw text and throw an error
                    console.error("Failed to parse JSON from get_job_history.php:", text);
                    throw new Error("Server returned an invalid response for job history.");
                }
            });
        })
        .then(data => {
            const historyContainer = document.getElementById('job-history-container');
            if (data.success && data.data.length > 0) {
                let historyHtml = '<ul class="job-history-list">';
                data.data.forEach(job => {
                    const statusClass = job.completion_status.toLowerCase(); // Will be 'success' or 'failed'
                    historyHtml += `<li class="job-history-item">
                        <div class="history-field"><strong>Booking ID:</strong> ${job.booking_id}</div>
                        <div class="history-field"><strong>Technician:</strong> ${job.technician_name}</div>
                        <div class="history-field"><strong>Date:</strong> ${job.booking_date}</div>
                        <div class="history-field"><strong>Status:</strong> <span class="status-${statusClass}">${job.completion_status}</span></div>
                        <div class="history-field"><strong>Notes:</strong> ${job.technician_notes || 'N/A'}</div>
                    </li>`;
                });
                historyHtml += '</ul>';
                historyContainer.innerHTML = historyHtml;
            } else {
                historyContainer.innerHTML = '<p>No job history found.</p>';
            }
        })
        .catch(error => {
            console.error("Error fetching job history:", error);
            alert("An error occurred while fetching job history data.");
        });
}


function loadCustomerProfile() {
    fetch('get_customer_profile.php')
        .then(response => {
            // Get the raw text from the response first
            return response.text().then(text => {
                try {
                    // Then, try to parse it as JSON
                    return JSON.parse(text);
                } catch (e) {
                    // If parsing fails, log the raw text and throw an error
                    console.error("Failed to parse JSON from get_customer_profile.php:", text);
                    throw new Error("Server returned an invalid response for customer profile.");
                }
            });
        })
        .then(data => {
            if (data.success) {
                document.getElementById("userName").innerText = data.data.userName;
                document.getElementById("userEmailDisplay").innerText = data.data.userEmail;
                document.getElementById("userEmail").value = data.data.userEmail || '';

                // Display gender as fixed text
                document.getElementById("genderDisplay").innerText = capitalizeFirstLetter(data.data.gender || 'Female');

                document.getElementById("phone").value = data.data.phone || '';
                document.getElementById("address").value = data.data.address || '';
                document.getElementById("city").value = data.data.city || '';
                document.getElementById("state").value = data.data.state || '';
                document.getElementById("pincode").value = data.data.pincode || '';

                // Set avatar based on fetched gender
                document.getElementById("avatarImg").src = data.data.gender === "male"
                    ? "../login/Photos/male.png"
                    : "../login/Photos/female.png";
            } else {
                console.error("Failed to load profile:", data.message);
                alert("Failed to load profile: " + data.message);
                // Set default values if profile loading fails
                document.getElementById("avatarImg").src = "../login/Photos/female.png";
                document.getElementById("userName").innerText = "Guest User";
                document.getElementById("userEmailDisplay").innerText = "guest@example.com";
                document.getElementById("userEmail").value = "guest@example.com";
                document.getElementById("genderDisplay").innerText = "Not Specified";
            }
        })
        .catch(error => {
            console.error("Error fetching profile:", error);
            alert("An error occurred while fetching profile data. Please check console for details.");
            // Set default values if there's a network error
            document.getElementById("avatarImg").src = "../login/Photos/female.png";
            document.getElementById("userName").innerText = "Error Loading";
            document.getElementById("userEmailDisplay").innerText = "error@example.com";
            document.getElementById("userEmail").value = "error@example.com";
            document.getElementById("genderDisplay").innerText = "Error";
        });
}

function saveProfile() {
    // Client-side validation
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
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

    // Prepare data for AJAX request
    const formData = new FormData();
    formData.append('email', email); // Email is included
    // Gender is NOT included as it's a fixed display now
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('pincode', pincode);

    fetch('update_customer_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Profile saved successfully!");
            // Re-load profile data to reflect any changes
            loadCustomerProfile();
        } else {
            console.error("Failed to save profile:", data.message);
            alert("Failed to save profile: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error saving profile:", error);
        alert("An error occurred while saving profile data. Please check console for details.");
    });

    return false; // Prevent default form submission
}

// Helper function to capitalize the first letter for display
function capitalizeFirstLetter(string) {
    if(!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}