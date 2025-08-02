document.addEventListener('DOMContentLoaded', function() {
    // --- State Object ---
    let technicianProfile = {};

    // --- DOM Elements ---
    const technicianNameDisplay = document.getElementById('technicianNameDisplay');
    const technicianEmailDisplay = document.getElementById('technicianEmailDisplay');
    const form = document.getElementById('technicianProfileForm');
    const saveMessage = document.getElementById('saveMessage');
    const skillsContainer = document.getElementById('skillsContainer');
    const newSkillInput = document.getElementById('newSkillInput');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const certificatesList = document.getElementById('certificatesList');
    const newCertNameInput = document.getElementById('newCertNameInput');
    const newCertIssuerInput = document.getElementById('newCertIssuerInput');
    const newCertYearInput = document.getElementById('newCertYearInput');
    const addCertificateBtn = document.getElementById('addCertificateBtn');
    
    // --- Functions ---

    // Fetches profile data from the server
    async function loadProfileData() {
        try {
            const response = await fetch('get_technician_profile.php');
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            if (result.success) {
                technicianProfile = result.data;
                renderProfileUI();
            } else {
                alert('Error loading profile: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            alert('An error occurred while fetching your profile.');
        }
    }

    // Renders the fetched data to the UI
    function renderProfileUI() {
        technicianNameDisplay.textContent = technicianProfile.full_name || 'Technician';
        technicianEmailDisplay.textContent = technicianProfile.email || 'email@example.com';
        
        // Populate form fields
        for (const key in technicianProfile) {
            const input = document.getElementById(key);
            if (input) {
                input.value = technicianProfile[key] || '';
            }
        }
        renderSkills();
        renderCertificates();
    }

    // Renders skill tags
    function renderSkills() {
        skillsContainer.innerHTML = '';
        const skills = technicianProfile.skills ? JSON.parse(technicianProfile.skills) : [];
        if (skills.length > 0) {
            skills.forEach(skill => {
                const skillSpan = document.createElement('span');
                skillSpan.className = 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center';
                skillSpan.innerHTML = `${skill} <button type="button" class="ml-1 text-indigo-500 hover:text-indigo-700 remove-skill-btn" data-skill="${skill}"> &times; </button>`;
                skillsContainer.appendChild(skillSpan);
            });
        } else {
            skillsContainer.innerHTML = '<span class="text-gray-500 text-sm">No skills added.</span>';
        }
    }

    // Renders certificate list
    function renderCertificates() {
        certificatesList.innerHTML = '';
        const certificates = technicianProfile.certificates ? JSON.parse(technicianProfile.certificates) : [];
        if (certificates.length > 0) {
            certificates.forEach((cert, index) => {
                const certLi = document.createElement('li');
                certLi.className = 'text-sm text-gray-700 flex justify-between items-center';
                certLi.innerHTML = `<span><strong>${cert.name}</strong> - ${cert.issuer} (${cert.year})</span> <button type="button" class="text-red-500 hover:text-red-700 remove-cert-btn" data-index="${index}">Remove</button>`;
                certificatesList.appendChild(certLi);
            });
        } else {
            certificatesList.innerHTML = '<li class="text-gray-500 text-sm">No certificates added.</li>';
        }
    }
    
    // --- Event Listeners ---

    // Add Skill
    addSkillBtn.addEventListener('click', () => {
        const skill = newSkillInput.value.trim();
        let skills = technicianProfile.skills ? JSON.parse(technicianProfile.skills) : [];
        if (skill && !skills.includes(skill)) {
            skills.push(skill);
            technicianProfile.skills = JSON.stringify(skills);
            newSkillInput.value = '';
            renderSkills();
        }
    });

    // Remove Skill (using event delegation)
    skillsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            const skillToRemove = e.target.dataset.skill;
            let skills = JSON.parse(technicianProfile.skills);
            skills = skills.filter(s => s !== skillToRemove);
            technicianProfile.skills = JSON.stringify(skills);
            renderSkills();
        }
    });

    // Add Certificate
    addCertificateBtn.addEventListener('click', () => {
        const name = newCertNameInput.value.trim();
        const issuer = newCertIssuerInput.value.trim();
        const year = newCertYearInput.value.trim();
        if (name && issuer && year) {
            let certificates = technicianProfile.certificates ? JSON.parse(technicianProfile.certificates) : [];
            certificates.push({ name, issuer, year });
            technicianProfile.certificates = JSON.stringify(certificates);
            newCertNameInput.value = '';
            newCertIssuerInput.value = '';
            newCertYearInput.value = '';
            renderCertificates();
        }
    });

    // Remove Certificate (using event delegation)
    certificatesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-cert-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            let certificates = JSON.parse(technicianProfile.certificates);
            certificates.splice(indexToRemove, 1);
            technicianProfile.certificates = JSON.stringify(certificates);
            renderCertificates();
        }
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveMessage.textContent = 'Saving...';
        saveMessage.style.color = 'blue';

        const formData = new FormData(form);
        // Append skills and certificates manually as they are not standard form inputs
        formData.append('skills', technicianProfile.skills || '[]');
        formData.append('certificates', technicianProfile.certificates || '[]');

        try {
            const response = await fetch('update_technician_profile.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                saveMessage.textContent = 'Profile saved successfully!';
                saveMessage.style.color = 'green';
            } else {
                saveMessage.textContent = 'Error: ' + result.message;
                saveMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Save error:', error);
            saveMessage.textContent = 'An unexpected error occurred.';
            saveMessage.style.color = 'red';
        }
        setTimeout(() => saveMessage.textContent = '', 3000);
    });

    // --- Initial Load ---
    loadProfileData();
});
