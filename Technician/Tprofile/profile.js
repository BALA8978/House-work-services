// profile.js

function logout() {
    // This is a placeholder for a proper logout function that would clear the session.
    // For this example, we'll just redirect to the homepage.
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = '../../../Customers/login/homepage/index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadTechnicianProfile();
});

// Function to handle tab switching
function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector(`.tab[onclick*='${tabId}']`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
}

// Function to fetch and display technician profile data
async function loadTechnicianProfile() {
    try {
        const response = await fetch('get_technician_profile.php');
        
        // --- Improved Error Handling ---
        // First, get the raw text from the response
        const responseText = await response.text();

        // Then, try to parse it as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // If parsing fails, it means the response was not valid JSON (e.g., a PHP error)
            console.error("Failed to parse JSON:", responseText);
            alert("Server returned an invalid response. Check the console for details.");
            return; // Stop execution
        }

        if (data.success) {
            const profile = data.data;
            document.getElementById("userName").innerText = profile.userName || 'N/A';
            document.getElementById("userEmailDisplay").innerText = profile.userEmail || 'N/A';
            
            // CORRECTED: Only populate the fields that the PHP script actually provides.
            document.getElementById("skills").value = profile.skills || '';
            document.getElementById("phone").value = profile.phone || '';

            // Set a default avatar or a gender-specific one
            document.getElementById("avatarImg").src = profile.gender === "male" 
                ? "../../Customers/login/Photos/male.png" 
                : "../../Customers/login/Photos/female.png";
        } else {
            console.error("Failed to load profile:", data.message);
            alert("Failed to load profile: " + data.message);
            // Fallback for a new technician with no profile yet
            document.getElementById("userName").innerText = "New Technician";
            document.getElementById("userEmailDisplay").innerText = "Please complete your profile.";
            document.getElementById("avatarImg").src = "https://placehold.co/150x150/e5e7eb/4b5563?text=User";
        }
    } catch (error) {
        console.error("Network or fetch error:", error);
        alert("A network error occurred while fetching profile data.");
    }
}

// Function to save profile changes
async function saveProfile() {
    const form = document.getElementById("infoForm");
    const formData = new FormData(form);

    // Dynamically get the gender from the loaded profile data if possible
    const currentGender = document.getElementById("avatarImg").src.includes("male.png") ? "male" : "female";
    formData.append('gender', currentGender);

    try {
        const response = await fetch('update_technician_profile.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert("Profile saved successfully!");
            loadTechnicianProfile(); // Reload the profile data to show the changes
        } else {
            alert("Failed to save profile: " .concat(data.message || 'Unknown error.'));
        }
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("An error occurred while saving profile data.");
    }
}
