// File: /Technician/Tprofile/profile.js (Redesigned)

document.addEventListener('DOMContentLoaded', function() {
    // Initial data load
    loadTechnicianProfile();
    loadJobHistory();

    // Tab navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Edit/Save/Cancel button listeners
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const profileForm = document.getElementById('profile-form');
    
    editBtn.addEventListener('click', toggleEditMode);
    cancelBtn.addEventListener('click', toggleEditMode);
    profileForm.addEventListener('submit', saveProfile);
});

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // Deactivate all nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Show selected tab and activate its link
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.nav-link[data-tab="${tabId}"]`).classList.add('active');
}

function toggleEditMode() {
    const form = document.getElementById('profile-form');
    const formActions = document.querySelector('.form-actions');
    const editBtn = document.getElementById('edit-profile-btn');
    const inputs = form.querySelectorAll('input, textarea, select');

    const isCurrentlyDisabled = inputs[0].disabled;

    inputs.forEach(input => {
        input.disabled = !isCurrentlyDisabled;
    });

    formActions.classList.toggle('hidden');
    editBtn.style.display = isCurrentlyDisabled ? 'none' : 'inline-flex';

    // If cancelling, reload the original data to discard changes
    if (!isCurrentlyDisabled) {
        loadTechnicianProfile();
    }
}


async function loadTechnicianProfile() {
    try {
        const response = await fetch('get_technician_profile.php');
        const result = await response.json();

        if (result.success && result.data) {
            const profile = result.data;
            document.getElementById("userName").innerText = profile.userName || 'N/A';
            document.getElementById("userEmailDisplay").innerText = profile.userEmail || 'N/A';
            document.getElementById("phone").value = profile.phone_number || '';
            document.getElementById("area").value = profile.area || '';
            document.getElementById("experience").value = profile.experience || '0';
            document.getElementById("services").value = profile.services || '';
            document.getElementById("isAvailable").checked = !!parseInt(profile.isAvailable);
            
            document.getElementById("avatarImg").src = profile.gender === "male"
                ? "../../Customers/login/Photos/male.png"
                : "../../Customers/login/Photos/female.png";
        } else {
            console.error("Failed to load profile:", result.message);
        }
    } catch (error) {
        console.error("Network or fetch error:", error);
    }
}

async function saveProfile(event) {
    event.preventDefault();
    const form = document.getElementById('profile-form');
    const formData = new FormData(form);
    const saveButton = form.querySelector('.save-btn');
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    try {
        const response = await fetch('update_technician_profile.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        alert(result.message); // Show success or error message from server

        if (result.success) {
            toggleEditMode(); // Exit edit mode
            loadTechnicianProfile(); // Reload profile to show saved data
        }
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("An error occurred while saving. Please try again.");
    } finally {
        saveButton.textContent = 'Save Changes';
        saveButton.disabled = false;
    }
}

// Job history function from previous step (no changes needed)
async function loadJobHistory() {
    const historyContainer = document.getElementById('job-history-container');
    if (!historyContainer) return;
    try {
        const response = await fetch('get_job_history.php');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            let historyHtml = '<ul class="job-history-list">';
            result.data.forEach(job => {
                const statusClass = job.completion_status.toLowerCase();
                let photosHtml = '';
                if (job.work_photos_path) {
                    const photoPaths = job.work_photos_path.split(',');
                    photosHtml += '<div class="history-photos">';
                    photoPaths.forEach(path => {
                        const correctPath = `../../${path.trim()}`;
                        photosHtml += `<a href="${correctPath}" target="_blank"><img src="${correctPath}" alt="Work Photo"></a>`;
                    });
                    photosHtml += '</div>';
                }
                historyHtml += `
                    <li class="job-history-item">
                        <div class="history-header"><span class="history-date">${job.booking_date}</span><span class="status-${statusClass}">${job.completion_status}</span></div>
                        <div class="history-field"><strong>Customer:</strong> ${job.customer_name}</div>
                        <div class="history-field"><strong>Booking ID:</strong> ${job.booking_id}</div>
                        <div class="history-field"><strong>Notes:</strong> ${job.technician_notes || 'N/A'}</div>
                        ${photosHtml}
                    </li>`;
            });
            historyHtml += '</ul>';
            historyContainer.innerHTML = historyHtml;
        } else {
            historyContainer.innerHTML = `<p>${result.message || 'No job history found.'}</p>`;
        }
    } catch (error) {
        console.error("Error fetching job history:", error);
        historyContainer.innerHTML = '<p>An error occurred while fetching job history.</p>';
    }
}