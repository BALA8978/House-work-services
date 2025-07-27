document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const infoTabBtn = document.getElementById('infoTabBtn');
    const historyTabBtn = document.getElementById('historyTabBtn');
    const settingsTabBtn = document.getElementById('settingsTabBtn');

    const infoContent = document.getElementById('infoContent');
    const historyContent = document.getElementById('historyContent');
    const settingsContent = document.getElementById('settingsContent');

    const technicianProfileForm = document.getElementById('technicianProfileForm');
    const technicianNameDisplay = document.getElementById('technicianNameDisplay');
    const technicianEmailDisplay = document.getElementById('technicianEmailDisplay');
    const technicianPhoneDisplay = document.getElementById('technicianPhoneDisplay');
    const technicianTitleDisplay = document.getElementById('technicianTitleDisplay');

    const aboutInput = document.getElementById('about');
    const specialtyInput = document.getElementById('specialty');
    const experienceSelect = document.getElementById('experience');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const pincodeInput = document.getElementById('pincode');

    const skillsContainer = document.getElementById('skillsContainer');
    const newSkillInput = document.getElementById('newSkillInput');
    const addSkillBtn = document.getElementById('addSkillBtn');

    const certificatesList = document.getElementById('certificatesList');
    const newCertNameInput = document.getElementById('newCertNameInput');
    const newCertIssuerInput = document.getElementById('newCertIssuerInput');
    const newCertYearInput = document.getElementById('newCertYearInput');
    const certificateUploadInput = document.getElementById('certificateUploadInput'); // New
    const addCertificateBtn = document.getElementById('addCertificateBtn');

    const saveMessage = document.getElementById('saveMessage');
    const certificateUploadMessage = document.getElementById('certificateUploadMessage'); // New

    // Settings Tab Elements
    const settingsCategoryList = document.getElementById('settingsCategoryList'); // Main list of settings
    const passwordSettingItem = document.getElementById('passwordSettingItem');
    const notificationsSettingItem = document.getElementById('notificationsSettingItem');
    const languageSettingItem = document.getElementById('languageSettingItem');
    const bankUpiSettingItem = document.getElementById('bankUpiSettingItem');
    const refundsSettingItem = document.getElementById('refundsSettingItem');
    const deleteAccountSettingItem = document.getElementById('deleteAccountSettingItem'); // New
    const logoutSettingItem = document.getElementById('logoutSettingItem'); // New

    const passwordSection = document.getElementById('passwordSection');
    const notificationsSection = document.getElementById('notificationsSection');
    const languageSection = document.getElementById('languageSection');
    const bankUpiSection = document.getElementById('bankUpiSection');
    const refundsSection = document.getElementById('refundsSection');
    const deleteAccountSection = document.getElementById('deleteAccountSection'); // New
    const logoutSection = document.getElementById('logoutSection'); // New

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const emailNotificationsCheckbox = document.getElementById('emailNotifications');
    const smsNotificationsCheckbox = document.getElementById('smsNotifications');
    const timezoneSelect = document.getElementById('timezone');
    const languageSelect = document.getElementById('language');
    const bankNameInput = document.getElementById('bankName');
    const accountNumberInput = document.getElementById('accountNumber');
    const ifscCodeInput = document.getElementById('ifscCode');
    const upiIdInput = document.getElementById('upiId');
    const lastRefundDateDisplay = document.getElementById('lastRefundDate'); // For refunds section

    const deleteConfirmationInput = document.getElementById('deleteConfirmationInput'); // New
    const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn'); // New
    const deleteAccountMessage = document.getElementById('deleteAccountMessage'); // New

    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn'); // New (inside logoutSection)
    const logoutMessage = document.getElementById('logoutMessage'); // New

    const saveSettingsMessage = document.getElementById('saveSettingsMessage'); // General settings save message
    const passwordSaveMessage = document.getElementById('passwordSaveMessage'); // Specific password save message
    const notificationsSaveMessage = document.getElementById('notificationsSaveMessage'); // Specific notifications save message
    const languageSaveMessage = document.getElementById('languageSaveMessage'); // Specific language save message
    const bankUpiSaveMessage = document.getElementById('bankUpiSaveMessage'); // Specific bank/UPI save message
    const refundsSaveMessage = document.getElementById('refundsSaveMessage'); // Specific refunds message

    // Modal elements
    const confirmationModal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');


    // --- Data Model (Softcode) ---
    let technicianProfile = {
        name: 'Technician Name', // Default name, as registration simulation is removed
        title: 'Home Services Technician', // Default title
        email: '',
        phone: '',
        location: '',
        about: '',
        specialty: '',
        experienceLevel: '',
        skills: [],
        certificates: [], // Each certificate can now optionally have a fileName
        gender: 'Prefer not to say', // Default gender
        address: '',
        city: '',
        state: '',
        pincode: '',
        // Settings fields
        settings: {
            emailNotifications: true,
            smsNotifications: false,
            timezone: 'UTC+00',
            language: 'en',
            bankDetails: {
                bankName: '',
                accountNumber: '',
                ifscCode: ''
            },
            upiId: '',
            lastRefundDate: 'N/A' // Example for refunds section
        }
    };

    const LOCAL_STORAGE_KEY = 'technicianProfileData';

    // --- Functions ---

    // Function to load data from localStorage
    function loadProfileData() {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Merge with default to ensure new fields exist on load
            technicianProfile = {
                ...technicianProfile,
                ...parsedData,
                settings: {
                    ...technicianProfile.settings,
                    ...(parsedData.settings || {}),
                    bankDetails: { // Ensure bankDetails is merged correctly
                        ...technicianProfile.settings.bankDetails,
                        ...((parsedData.settings && parsedData.settings.bankDetails) || {})
                    }
                }
            };
        }
    }

    // Function to save data to localStorage
    function saveProfileData() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(technicianProfile));
        displaySaveMessage('Profile saved successfully!', 'text-green-600', saveMessage);
    }

    // Function to save settings data to localStorage
    function saveSettingsData(messageElement) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(technicianProfile));
        displaySaveMessage('Settings saved successfully!', 'text-green-600', messageElement);
    }

    // Function to render profile data to the UI
    function renderProfileUI() {
        if (technicianNameDisplay) technicianNameDisplay.textContent = technicianProfile.name || 'Technician Name';
        if (technicianEmailDisplay) technicianEmailDisplay.textContent = technicianProfile.email || 'email@example.com';
        if (technicianPhoneDisplay) technicianPhoneDisplay.textContent = technicianProfile.phone || '+1 (XXX) XXX-XXXX';
        if (technicianTitleDisplay) technicianTitleDisplay.textContent = technicianProfile.title || 'Home Services Technician';

        if (aboutInput) aboutInput.value = technicianProfile.about;
        if (specialtyInput) specialtyInput.value = technicianProfile.specialty;
        if (experienceSelect) experienceSelect.value = technicianProfile.experienceLevel;
        if (emailInput) emailInput.value = technicianProfile.email;
        if (phoneInput) phoneInput.value = technicianProfile.phone;
        if (addressInput) addressInput.value = technicianProfile.address;
        if (cityInput) cityInput.value = technicianProfile.city;
        if (stateInput) stateInput.value = technicianProfile.state;
        if (pincodeInput) pincodeInput.value = technicianProfile.pincode;

        renderSkills();
        renderCertificates();
        renderSettingsUI(); // Render settings when profile UI is rendered
    }

    // Render Settings UI (main list and individual sections)
    function renderSettingsUI() {
        // Set values for individual setting inputs
        if (emailNotificationsCheckbox) emailNotificationsCheckbox.checked = technicianProfile.settings.emailNotifications;
        if (smsNotificationsCheckbox) smsNotificationsCheckbox.checked = technicianProfile.settings.smsNotifications;
        if (timezoneSelect) timezoneSelect.value = technicianProfile.settings.timezone;
        if (languageSelect) languageSelect.value = technicianProfile.settings.language;
        if (bankNameInput) bankNameInput.value = technicianProfile.settings.bankDetails.bankName;
        if (accountNumberInput) accountNumberInput.value = technicianProfile.settings.bankDetails.accountNumber;
        if (ifscCodeInput) ifscCodeInput.value = technicianProfile.settings.bankDetails.ifscCode;
        if (upiIdInput) upiIdInput.value = technicianProfile.settings.upiId;
        if (lastRefundDateDisplay) lastRefundDateDisplay.textContent = technicianProfile.settings.lastRefundDate;

        // Initially show the category list and hide all individual sections
        if (settingsCategoryList) settingsCategoryList.classList.remove('hidden');
        if (passwordSection) passwordSection.classList.add('hidden');
        if (notificationsSection) notificationsSection.classList.add('hidden');
        if (languageSection) languageSection.classList.add('hidden');
        if (bankUpiSection) bankUpiSection.classList.add('hidden');
        if (refundsSection) refundsSection.classList.add('hidden');
        if (deleteAccountSection) deleteAccountSection.classList.add('hidden'); // New
        if (logoutSection) logoutSection.classList.add('hidden'); // New
    }

    // Function to show a specific settings section
    function showSettingSection(sectionId) {
        // Hide all sections first
        if (settingsCategoryList) settingsCategoryList.classList.add('hidden');
        if (passwordSection) passwordSection.classList.add('hidden');
        if (notificationsSection) notificationsSection.classList.add('hidden');
        if (languageSection) languageSection.classList.add('hidden');
        if (bankUpiSection) bankUpiSection.classList.add('hidden');
        if (refundsSection) refundsSection.classList.add('hidden');
        if (deleteAccountSection) deleteAccountSection.classList.add('hidden'); // New
        if (logoutSection) logoutSection.classList.add('hidden'); // New

        // Show the requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }

    // Render Skills
    function renderSkills() {
        if (!skillsContainer) return; // Ensure container exists
        skillsContainer.innerHTML = ''; // Clear existing skills
        if (technicianProfile.skills && technicianProfile.skills.length > 0) {
            technicianProfile.skills.forEach((skill, index) => {
                const skillSpan = document.createElement('span');
                skillSpan.className = 'bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center';
                skillSpan.innerHTML = `
                    ${skill}
                    <button type="button" class="ml-1 text-indigo-500 hover:text-indigo-700 focus:outline-none remove-skill-btn" data-skill="${skill}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                `;
                skillsContainer.appendChild(skillSpan);
            });
        } else {
            skillsContainer.innerHTML = '<span class="text-gray-500 text-sm">No skills added yet.</span>';
        }
    }

    // Render Certificates
    function renderCertificates() {
        if (!certificatesList) return; // Ensure container exists
        certificatesList.innerHTML = ''; // Clear existing certificates
        if (technicianProfile.certificates && technicianProfile.certificates.length > 0) {
            technicianProfile.certificates.forEach((cert, index) => {
                const certLi = document.createElement('li');
                certLi.className = 'text-sm text-gray-700 flex justify-between items-center';
                // Display file name if available, otherwise just name, issuer, year
                const fileNameDisplay = cert.fileName ? `<span class="italic text-gray-500">(${cert.fileName})</span>` : '';
                certLi.innerHTML = `
                    <span>
                        <span class="font-medium text-gray-800">${cert.name}</span> - ${cert.issuer} (${cert.year}) ${fileNameDisplay}
                    </span>
                    <button type="button" class="text-red-500 hover:text-red-700 text-xs font-medium remove-cert-btn" data-index="${index}">Remove</button>
                `;
                certificatesList.appendChild(certLi);
            });
        } else {
            certificatesList.innerHTML = '<li class="text-gray-500 text-sm">No certificates added yet.</li>';
        }
    }

    // Add Skill
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', function() {
            const skill = newSkillInput.value.trim();
            if (skill && !technicianProfile.skills.includes(skill)) {
                technicianProfile.skills.push(skill);
                newSkillInput.value = '';
                renderSkills();
                validateField('skills'); // Re-validate skills after adding
            } else if (skill && technicianProfile.skills.includes(skill)) {
                displaySaveMessage('Skill already exists!', 'text-yellow-600', saveMessage);
            }
        });
    }

    // Remove Skill (Event delegation)
    if (skillsContainer) {
        skillsContainer.addEventListener('click', function(event) {
            if (event.target.closest('.remove-skill-btn')) {
                const skillToRemove = event.target.closest('.remove-skill-btn').dataset.skill;
                technicianProfile.skills = technicianProfile.skills.filter(s => s !== skillToRemove);
                renderSkills();
                validateField('skills'); // Re-validate skills after removing
            }
        });
    }

    // Add Certificate
    if (addCertificateBtn) {
        addCertificateBtn.addEventListener('click', function() {
            const name = newCertNameInput.value.trim();
            const issuer = newCertIssuerInput.value.trim();
            const year = newCertYearInput.value.trim();
            const file = certificateUploadInput.files[0]; // Get the selected file

            if (name && issuer && year && /^\d{4}$/.test(year)) {
                const newCert = { name, issuer, year, fileName: file ? file.name : '' }; // Store file name
                // Check for duplicates (simple check based on all fields)
                const isDuplicate = technicianProfile.certificates.some(
                    cert => cert.name === name && cert.issuer === issuer && cert.year === year && cert.fileName === newCert.fileName
                );
                if (!isDuplicate) {
                    technicianProfile.certificates.push(newCert);
                    newCertNameInput.value = '';
                    newCertIssuerInput.value = '';
                    newCertYearInput.value = '';
                    certificateUploadInput.value = ''; // Clear file input
                    renderCertificates();
                    validateField('certificates'); // Re-validate certificates after adding
                    displaySaveMessage('Certificate added successfully!', 'text-green-600', certificateUploadMessage);
                } else {
                    displaySaveMessage('Certificate with these details already exists!', 'text-yellow-600', certificateUploadMessage);
                }
            } else {
                displaySaveMessage('Please fill all certificate fields correctly (Year must be 4 digits)!', 'text-red-600', certificateUploadMessage);
            }
        });
    }

    // Handle Certificate File Upload Input Change
    if (certificateUploadInput) {
        certificateUploadInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                displaySaveMessage(`File selected: ${this.files[0].name}`, 'text-blue-600', certificateUploadMessage);
            } else {
                displaySaveMessage('No file selected.', 'text-gray-600', certificateUploadMessage);
            }
        });
    }

    // Remove Certificate (Event delegation)
    if (certificatesList) {
        certificatesList.addEventListener('click', function(event) {
            if (event.target.closest('.remove-cert-btn')) {
                const indexToRemove = parseInt(event.target.closest('.remove-cert-btn').dataset.index);
                technicianProfile.certificates.splice(indexToRemove, 1);
                renderCertificates();
                validateField('certificates'); // Re-validate certificates after removing
            }
        });
    }

    // --- Tab Switching Logic ---
    function activateTab(activeBtn, activeContent) {
        // Deactivate all tabs and hide all content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

        // Activate the clicked tab and show its content
        activeBtn.classList.add('active');
        activeContent.classList.remove('hidden');
    }

    // Event Listeners for Tab Buttons
    if (infoTabBtn) {
        infoTabBtn.addEventListener('click', () => activateTab(infoTabBtn, infoContent));
    }
    if (historyTabBtn) {
        historyTabBtn.addEventListener('click', () => activateTab(historyTabBtn, historyContent));
    }
    if (settingsTabBtn) {
        settingsTabBtn.addEventListener('click', () => activateTab(settingsTabBtn, settingsContent));
    }


    // --- Form Submission and Validation ---
    const formFields = ['about', 'specialty', 'experience', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const settingFields = ['currentPassword', 'newPassword', 'confirmNewPassword', 'bankName', 'accountNumber', 'ifscCode', 'upiId'];

    // Add blur event listeners for immediate validation feedback
    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('blur', () => validateField(fieldId));
            // Add input event listener for real-time validation for specific types
            if (element.type === 'email' || element.type === 'tel' || element.hasAttribute('pattern')) {
                element.addEventListener('input', () => validateField(fieldId));
            }
        }
    });

    // Special case for skills and certificates (they are validated when added/removed)
    if (newSkillInput) newSkillInput.addEventListener('input', () => clearValidationError('skills'));
    if (newCertNameInput) newCertNameInput.addEventListener('input', () => clearValidationError('certificates'));


    if (technicianProfileForm) {
        technicianProfileForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            let allFieldsValid = true;

            // Validate all form fields
            formFields.forEach(fieldId => {
                if (!validateField(fieldId)) {
                    allFieldsValid = false;
                }
            });

            // Validate skills and certificates specifically
            if (technicianProfile.skills.length === 0) {
                showValidationError('skills', 'At least one skill is required.');
                allFieldsValid = false;
            } else {
                clearValidationError('skills');
            }

            if (technicianProfile.certificates.length === 0) {
                showValidationError('certificates', 'At least one certificate is required.');
                allFieldsValid = false;
            } else {
                clearValidationError('certificates');
            }

            if (allFieldsValid) {
                // Update technicianProfile object with current form values
                technicianProfile.about = aboutInput.value.trim();
                technicianProfile.specialty = specialtyInput.value.trim();
                technicianProfile.experienceLevel = experienceSelect.value;
                technicianProfile.email = emailInput.value.trim();
                technicianProfile.phone = phoneInput.value.trim();
                technicianProfile.address = addressInput.value.trim();
                technicianProfile.city = cityInput.value.trim();
                technicianProfile.state = stateInput.value.trim();
                technicianProfile.pincode = pincodeInput.value.trim();

                // Assuming name and title are set elsewhere or are static for this form
                // technicianProfile.name = technicianNameInput.value.trim();
                // technicianProfile.title = technicianTitleInput.value.trim();

                saveProfileData();
            } else {
                displaySaveMessage('Please correct the errors in the form.', 'text-red-600', saveMessage);
            }
        });
    }


    function showValidationError(elementId, message) {
        const errorElement = document.getElementById(elementId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            const inputElement = document.getElementById(elementId);
            if (inputElement) {
                inputElement.classList.add('border-red-500', 'shadow-red-200');
            }
        }
    }

    function clearValidationError(elementId) {
        const errorElement = document.getElementById(elementId + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            const inputElement = document.getElementById(elementId);
            if (inputElement) {
                inputElement.classList.remove('border-red-500', 'shadow-red-200');
            }
        }
    }

    function validateField(fieldId) {
        const inputElement = document.getElementById(fieldId);
        let isValid = true;
        if (inputElement) {
            if (inputElement.hasAttribute('required') && !inputElement.value.trim()) {
                showValidationError(fieldId, 'This field is required.');
                isValid = false;
            } else if (inputElement.type === 'email' && inputElement.value.trim() && !inputElement.validity.valid) {
                showValidationError(fieldId, 'Please enter a valid email address.');
                isValid = false;
            } else if (inputElement.type === 'tel' && inputElement.value.trim() && !inputElement.validity.valid) {
                showValidationError(fieldId, 'Please enter a valid phone number.');
                isValid = false;
            } else if (inputElement.hasAttribute('pattern') && inputElement.value.trim() && !inputElement.validity.valid) {
                showValidationError(fieldId, inputElement.title || 'Invalid format.');
                isValid = false;
            } else {
                clearValidationError(fieldId);
            }
        }
        // Special validation for Skills (mandatory check)
        if (fieldId === 'skills') {
            if (technicianProfile.skills.length === 0) {
                showValidationError('skills', 'At least one skill is required.');
                isValid = false;
            } else {
                clearValidationError('skills');
            }
        }
        // Special validation for Certificates (mandatory check)
        if (fieldId === 'certificates') {
            if (technicianProfile.certificates.length === 0) {
                showValidationError('certificates', 'At least one certificate is required.');
                isValid = false;
            } else {
                clearValidationError('certificates');
            }
        }
        // Password validation for settings
        if (fieldId === 'newPassword') {
            if (newPasswordInput && newPasswordInput.value.trim() && newPasswordInput.value.length < 8) {
                showValidationError('newPassword', 'Password must be at least 8 characters long.');
                isValid = false;
            } else {
                clearValidationError('newPassword');
            }
        }
        if (fieldId === 'confirmNewPassword') {
            if (newPasswordInput && confirmNewPasswordInput && newPasswordInput.value !== confirmNewPasswordInput.value) {
                showValidationError('confirmNewPassword', 'Passwords do not match.');
                isValid = false;
            } else {
                clearValidationError('confirmNewPassword');
            }
        }

        return isValid;
    }


    // --- Settings Section Logic ---

    // Event listeners for individual setting items to show their sections
    if (passwordSettingItem) {
        passwordSettingItem.addEventListener('click', () => showSettingSection('passwordSection'));
    }
    if (notificationsSettingItem) {
        notificationsSettingItem.addEventListener('click', () => showSettingSection('notificationsSection'));
    }
    if (languageSettingItem) {
        languageSettingItem.addEventListener('click', () => showSettingSection('languageSection'));
    }
    if (bankUpiSettingItem) {
        bankUpiSettingItem.addEventListener('click', () => showSettingSection('bankUpiSection'));
    }
    if (refundsSettingItem) {
        refundsSettingItem.addEventListener('click', () => showSettingSection('refundsSection'));
    }
    if (deleteAccountSettingItem) {
        deleteAccountSettingItem.addEventListener('click', () => showSettingSection('deleteAccountSection'));
    }
    if (logoutSettingItem) {
        logoutSettingItem.addEventListener('click', () => showSettingSection('logoutSection'));
    }

    // Event listeners for "Back to Settings" buttons
    document.querySelectorAll('.back-to-settings').forEach(button => {
        button.addEventListener('click', () => {
            if (settingsCategoryList) settingsCategoryList.classList.remove('hidden');
            if (passwordSection) passwordSection.classList.add('hidden');
            if (notificationsSection) notificationsSection.classList.add('hidden');
            if (languageSection) languageSection.classList.add('hidden');
            if (bankUpiSection) bankUpiSection.classList.add('hidden');
            if (refundsSection) refundsSection.classList.add('hidden');
            if (deleteAccountSection) deleteAccountSection.classList.add('hidden');
            if (logoutSection) logoutSection.classList.add('hidden');
        });
    });


    // Save Password Button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            let isValid = true;
            if (!validateField('currentPassword')) isValid = false;
            if (!validateField('newPassword')) isValid = false;
            if (!validateField('confirmNewPassword')) isValid = false;

            if (isValid) {
                // Here you would typically send the new password to a server
                // For this example, we'll just simulate success
                displaySaveMessage('Password changed successfully!', 'text-green-600', passwordSaveMessage);
                // Clear password fields for security
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
            } else {
                displaySaveMessage('Please correct the password errors.', 'text-red-600', passwordSaveMessage);
            }
        });
    }

    // Save Notifications Button
    const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', function() {
            if (emailNotificationsCheckbox) technicianProfile.settings.emailNotifications = emailNotificationsCheckbox.checked;
            if (smsNotificationsCheckbox) technicianProfile.settings.smsNotifications = smsNotificationsCheckbox.checked;
            if (timezoneSelect) technicianProfile.settings.timezone = timezoneSelect.value;
            saveSettingsData(notificationsSaveMessage);
        });
    }

    // Save Language Button
    const saveLanguageBtn = document.getElementById('saveLanguageBtn');
    if (saveLanguageBtn) {
        saveLanguageBtn.addEventListener('click', function() {
            if (languageSelect) technicianProfile.settings.language = languageSelect.value;
            saveSettingsData(languageSaveMessage);
        });
    }

    // Save Bank & UPI Details Button
    const saveBankUpiBtn = document.getElementById('saveBankUpiBtn');
    if (saveBankUpiBtn) {
        saveBankUpiBtn.addEventListener('click', function() {
            if (bankNameInput) technicianProfile.settings.bankDetails.bankName = bankNameInput.value.trim();
            if (accountNumberInput) technicianProfile.settings.bankDetails.accountNumber = accountNumberInput.value.trim();
            if (ifscCodeInput) technicianProfile.settings.bankDetails.ifscCode = ifscCodeInput.value.trim();
            if (upiIdInput) technicianProfile.settings.upiId = upiIdInput.value.trim();
            saveSettingsData(bankUpiSaveMessage);
        });
    }

    // Delete Account Confirmation Logic
    if (deleteConfirmationInput) {
        deleteConfirmationInput.addEventListener('input', function() {
            if (confirmDeleteAccountBtn) {
                confirmDeleteAccountBtn.disabled = (this.value.trim() !== 'DELETE');
            }
        });
    }

    if (confirmDeleteAccountBtn) {
        confirmDeleteAccountBtn.addEventListener('click', function() {
            if (deleteConfirmationInput && deleteConfirmationInput.value.trim() === 'DELETE') {
                // Simulate account deletion
                displaySaveMessage('Account deleted successfully. Redirecting...', 'text-green-600', deleteAccountMessage);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear stored data
                setTimeout(() => {
                    // Redirect or perform other post-deletion actions
                    window.location.href = 'about:blank'; // Example: go to a blank page
                }, 2000);
            } else {
                displaySaveMessage('Please type "DELETE" to confirm.', 'text-red-600', deleteAccountMessage);
            }
        });
    }

    // Logout Confirmation Logic
    // The confirmLogoutBtn is inside the logoutSection. I need to make sure I am getting the correct one.
    // There are two elements with ID 'confirmLogoutBtn' in the original Tprofile.html, one inside the modal, and one inside the logoutSection.
    // I renamed the one in the modal to 'modalConfirmLogoutBtn' to avoid id duplication.
    // The current logic in profile.js directly targets 'confirmLogoutBtn' for logout.
    // I will ensure the 'confirmLogoutBtn' refers to the one within the 'logoutSection'.
    const sectionLogoutBtn = document.getElementById('logoutSection').querySelector('#confirmLogoutBtn');
    if (sectionLogoutBtn) {
        sectionLogoutBtn.addEventListener('click', function() {
            showConfirmationModal('Are you sure you want to log out?', () => {
                // Simulate logout
                displaySaveMessage('Logged out successfully. Redirecting...', 'text-green-600', logoutMessage);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear stored data
                setTimeout(() => {
                    window.location.href = 'about:blank'; // Example: redirect to a login page
                }, 2000);
            });
        });
    }

    // Generic confirmation modal function
    function showConfirmationModal(message, onConfirmCallback) {
        if (confirmationModal && modalMessage && modalConfirmBtn && modalCancelBtn) {
            modalMessage.textContent = message;
            confirmationModal.classList.remove('hidden');

            const handleConfirm = () => {
                onConfirmCallback();
                confirmationModal.classList.add('hidden');
                modalConfirmBtn.removeEventListener('click', handleConfirm);
                modalCancelBtn.removeEventListener('click', handleCancel);
            };

            const handleCancel = () => {
                confirmationModal.classList.add('hidden');
                modalConfirmBtn.removeEventListener('click', handleConfirm);
                modalCancelBtn.removeEventListener('click', handleCancel);
            };

            modalConfirmBtn.addEventListener('click', handleConfirm);
            modalCancelBtn.addEventListener('click', handleCancel);
        }
    }


    function displaySaveMessage(message, colorClass, element) {
        if (!element) return; // Ensure element exists before trying to modify it
        element.textContent = message;
        element.className = `text-center text-sm mt-2 ${colorClass}`;
        element.classList.remove('hidden');
        setTimeout(() => {
            element.textContent = '';
            element.classList.add('hidden');
        }, 3000); // Hide message after 3 seconds
    }

    // --- Initial Load ---
    loadProfileData();
    renderProfileUI();
    if (infoTabBtn && infoContent) activateTab(infoTabBtn, infoContent); // Activate info tab on load
});