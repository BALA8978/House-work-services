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
            const addCertificateBtn = document.getElementById('addCertificateBtn');

            const saveMessage = document.getElementById('saveMessage');

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

            const confirmLogoutBtn = document.getElementById('confirmLogoutBtn'); // New
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
                certificates: [],
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
                        certLi.innerHTML = `
                            <span><span class="font-medium text-gray-800">${cert.name}</span> - ${cert.issuer} (${cert.year})</span>
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

                    if (name && issuer && year && /^\d{4}$/.test(year)) {
                        const newCert = { name, issuer, year };
                        // Check for duplicates (simple check based on all fields)
                        const isDuplicate = technicianProfile.certificates.some(
                            cert => cert.name === name && cert.issuer === issuer && cert.year === year
                        );

                        if (!isDuplicate) {
                            technicianProfile.certificates.push(newCert);
                            newCertNameInput.value = '';
                            newCertIssuerInput.value = '';
                            newCertYearInput.value = '';
                            renderCertificates();
                            validateField('certificates'); // Re-validate certificates after adding
                        } else {
                            displaySaveMessage('Certificate with these details already exists!', 'text-yellow-600', saveMessage);
                        }
                    } else {
                        displaySaveMessage('Please fill all certificate fields correctly (Year must be 4 digits)!', 'text-red-600', saveMessage);
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

            // --- Validation Functions ---
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

                // Bank & UPI Details validation
                if (fieldId === 'accountNumber' && accountNumberInput && accountNumberInput.value.trim() && !accountNumberInput.validity.valid) {
                    showValidationError('accountNumber', accountNumberInput.title);
                    isValid = false;
                }
                if (fieldId === 'ifscCode' && ifscCodeInput && ifscCodeInput.value.trim() && !ifscCodeInput.validity.valid) {
                    showValidationError('ifscCode', ifscCodeInput.title);
                    isValid = false;
                }
                if (fieldId === 'upiId' && upiIdInput && upiIdInput.value.trim() && !upiIdInput.validity.valid) {
                    showValidationError('upiId', upiIdInput.title);
                    isValid = false;
                }

                return isValid;
            }

            function validateForm(formType) {
                let isFormValid = true;
                let fieldsToValidate = [];

                if (formType === 'profile') {
                    fieldsToValidate = ['about', 'specialty', 'experience', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'skills', 'certificates'];
                } else if (formType === 'settings') {
                    // Determine which settings sub-form is active and validate its fields
                    if (passwordSection && !passwordSection.classList.contains('hidden')) {
                        // Password section is active
                        if (currentPasswordInput && newPasswordInput && confirmNewPasswordInput && (newPasswordInput.value.trim() || currentPasswordInput.value.trim() || confirmNewPasswordInput.value.trim())) {
                            fieldsToValidate = ['currentPassword', 'newPassword', 'confirmNewPassword'];
                        }
                    } else if (bankUpiSection && !bankUpiSection.classList.contains('hidden')) {
                        // Bank & UPI section is active
                        if (bankNameInput && bankNameInput.value.trim()) fieldsToValidate.push('bankName');
                        if (accountNumberInput && accountNumberInput.value.trim()) fieldsToValidate.push('accountNumber');
                        if (ifscCodeInput && ifscCodeInput.value.trim()) fieldsToValidate.push('ifscCode');
                        if (upiIdInput && upiIdInput.value.trim()) fieldsToValidate.push('upiId');
                    }
                    // Notifications, Language, Refunds, Delete, Logout sections don't have complex validation on save
                }


                fieldsToValidate.forEach(fieldId => {
                    if (!validateField(fieldId)) {
                        isFormValid = false;
                    }
                });
                return isFormValid;
            }

            // --- Event Listeners ---

            // Tab switching logic
            function activateTab(activeBtn, activeContent) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-gradient-to-r', 'from-purple-200', 'to-pink-200', 'text-purple-700', 'font-semibold'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

                if (activeBtn) activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-purple-200', 'to-pink-200', 'text-purple-700', 'font-semibold');
                if (activeContent) activeContent.classList.remove('hidden');

                // Special handling for settings tab to show the category list first
                if (activeContent === settingsContent) {
                    renderSettingsUI(); // This will show the main category list
                }
            }

            if (infoTabBtn) infoTabBtn.addEventListener('click', () => activateTab(infoTabBtn, infoContent));
            if (historyTabBtn) historyTabBtn.addEventListener('click', () => activateTab(historyTabBtn, historyContent));
            if (settingsTabBtn) settingsTabBtn.addEventListener('click', () => activateTab(settingsTabBtn, settingsContent));

            // Input change listeners for real-time data update and validation (Profile tab)
            if (aboutInput) aboutInput.addEventListener('input', (e) => { technicianProfile.about = e.target.value; validateField('about'); });
            if (specialtyInput) specialtyInput.addEventListener('input', (e) => { technicianProfile.specialty = e.target.value; validateField('specialty'); });
            if (experienceSelect) experienceSelect.addEventListener('change', (e) => { technicianProfile.experienceLevel = e.target.value; validateField('experience'); });
            if (emailInput) emailInput.addEventListener('input', (e) => { technicianProfile.email = e.target.value; validateField('email'); });
            if (phoneInput) phoneInput.addEventListener('input', (e) => { technicianProfile.phone = e.target.value; validateField('phone'); });
            if (addressInput) addressInput.addEventListener('input', (e) => { technicianProfile.address = e.target.value; validateField('address'); });
            if (cityInput) cityInput.addEventListener('input', (e) => { technicianProfile.city = e.target.value; validateField('city'); });
            if (stateInput) stateInput.addEventListener('input', (e) => { technicianProfile.state = e.target.value; validateField('state'); });
            if (pincodeInput) pincodeInput.addEventListener('input', (e) => { technicianProfile.pincode = e.target.value; validateField('pincode'); });


            // Form submission (Profile tab)
            if (technicianProfileForm) {
                technicianProfileForm.addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent default form submission

                    if (validateForm('profile')) {
                        saveProfileData();
                        renderProfileUI(); // Re-render UI to ensure display fields are updated
                    } else {
                        displaySaveMessage('Please correct the errors in the form.', 'text-red-600', saveMessage);
                    }
                });
            }

            // Input change listeners for Settings sub-sections
            if (currentPasswordInput) currentPasswordInput.addEventListener('input', () => { validateField('currentPassword'); });
            if (newPasswordInput) newPasswordInput.addEventListener('input', () => { validateField('newPassword'); validateField('confirmNewPassword'); });
            if (confirmNewPasswordInput) confirmNewPasswordInput.addEventListener('input', () => { validateField('confirmNewPassword'); });
            if (emailNotificationsCheckbox) emailNotificationsCheckbox.addEventListener('change', (e) => { technicianProfile.settings.emailNotifications = e.target.checked; });
            if (smsNotificationsCheckbox) smsNotificationsCheckbox.addEventListener('change', (e) => { technicianProfile.settings.smsNotifications = e.target.checked; });
            if (timezoneSelect) timezoneSelect.addEventListener('change', (e) => { technicianProfile.settings.timezone = e.target.value; });
            if (languageSelect) languageSelect.addEventListener('change', (e) => { technicianProfile.settings.language = e.target.value; });
            if (bankNameInput) bankNameInput.addEventListener('input', (e) => { technicianProfile.settings.bankDetails.bankName = e.target.value; validateField('bankName'); });
            if (accountNumberInput) accountNumberInput.addEventListener('input', (e) => { technicianProfile.settings.bankDetails.accountNumber = e.target.value; validateField('accountNumber'); });
            if (ifscCodeInput) ifscCodeInput.addEventListener('input', (e) => { technicianProfile.settings.bankDetails.ifscCode = e.target.value; validateField('ifscCode'); });
            if (upiIdInput) upiIdInput.addEventListener('input', (e) => { technicianProfile.settings.upiId = e.target.value; validateField('upiId'); });


            // Event listeners for individual setting items
            if (passwordSettingItem) passwordSettingItem.addEventListener('click', () => showSettingSection('passwordSection'));
            if (notificationsSettingItem) notificationsSettingItem.addEventListener('click', () => showSettingSection('notificationsSection'));
            if (languageSettingItem) languageSettingItem.addEventListener('click', () => showSettingSection('languageSection'));
            if (bankUpiSettingItem) bankUpiSettingItem.addEventListener('click', () => showSettingSection('bankUpiSection'));
            if (refundsSettingItem) refundsSettingItem.addEventListener('click', () => showSettingSection('refundsSection'));
            if (deleteAccountSettingItem) deleteAccountSettingItem.addEventListener('click', () => showSettingSection('deleteAccountSection')); // New
            if (logoutSettingItem) logoutSettingItem.addEventListener('click', () => showSettingSection('logoutSection')); // New

            // Event listeners for "Back to Settings" buttons
            document.querySelectorAll('.back-to-settings-list').forEach(button => {
                button.addEventListener('click', renderSettingsUI); // Go back to main settings list
            });

            // Event listeners for "Save" buttons within settings sub-sections
            document.querySelectorAll('.save-settings-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const settingType = this.dataset.settingType;
                    let messageElement;
                    let isValid = true;

                    // Determine which message element to use
                    switch(settingType) {
                        case 'password':
                            messageElement = passwordSaveMessage;
                            isValid = validateForm('settings'); // Re-validate only password fields
                            break;
                        case 'notifications':
                            messageElement = notificationsSaveMessage;
                            // No specific validation needed for checkboxes, always valid if interacted
                            break;
                        case 'language':
                            messageElement = languageSaveMessage;
                            // No specific validation needed for select, always valid if interacted
                            break;
                        case 'bankUpi':
                            messageElement = bankUpiSaveMessage;
                            isValid = validateForm('settings'); // Re-validate only bank/UPI fields
                            break;
                        case 'refunds':
                            messageElement = refundsSaveMessage;
                            // This is a static section, so "saving" here would just refresh info or signify acknowledgment
                            displaySaveMessage('Refunds info refreshed!', 'text-blue-600', messageElement);
                            return; // Don't save general profile data for this action
                        default:
                            messageElement = saveSettingsMessage;
                            break;
                    }

                    if (isValid) {
                        saveSettingsData(messageElement);
                        // Clear password fields after "save" for security
                        if (settingType === 'password') {
                            if (currentPasswordInput) currentPasswordInput.value = '';
                            if (newPasswordInput) newPasswordInput.value = '';
                            if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
                            clearValidationError('currentPassword');
                            clearValidationError('newPassword');
                            clearValidationError('confirmNewPassword');
                        }
                    } else {
                        displaySaveMessage('Please correct the errors.', 'text-red-600', messageElement);
                    }
                });
            });

            // Delete Account Confirmation Logic
            if (confirmDeleteAccountBtn) {
                confirmDeleteAccountBtn.addEventListener('click', function() {
                    if (deleteConfirmationInput && deleteConfirmationInput.value === 'DELETE') {
                        // Show modal for final confirmation
                        showConfirmationModal('Are you absolutely sure you want to delete your account? This action is irreversible.', () => {
                            localStorage.clear(); // Clear all data
                            displaySaveMessage('Account deleted. Redirecting...', 'text-green-600', deleteAccountMessage);
                            setTimeout(() => {
                                window.location.reload(); // Reload page to reflect deletion
                            }, 1500);
                        });
                    } else {
                        showValidationError('deleteConfirmationInput', 'Please type "DELETE" to confirm.');
                        displaySaveMessage('Confirmation failed. Type "DELETE" to proceed.', 'text-red-600', deleteAccountMessage);
                    }
                });
            }

            // Logout Confirmation Logic
            if (confirmLogoutBtn) {
                confirmLogoutBtn.addEventListener('click', function() {
                    showConfirmationModal('Are you sure you want to log out?', () => {
                        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear only profile data, keep name if needed for re-login simulation
                        displaySaveMessage('Logged out. Redirecting...', 'text-green-600', logoutMessage);
                        setTimeout(() => {
                            window.location.reload(); // Reload page to simulate logout
                        }, 1500);
                    });
                });
            }

            // Generic Confirmation Modal Functions
            function showConfirmationModal(message, onConfirmCallback) {
                if (!confirmationModal || !modalMessage || !modalConfirmBtn || !modalCancelBtn) return;

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
