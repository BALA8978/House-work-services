
 /* profile.js content embedded here */

    // Get DOM elements
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    const avatarImgElement = document.getElementById("avatarImg");
    const genderSelectElement = document.getElementById("genderSelect");

    // Info tab fields
    const phoneNumberInput = document.getElementById("phone"); // Corrected ID to 'phone'
    const addressInput = document.getElementById("address");
    const cityInput = document.getElementById("city");
    const stateInput = document.getElementById("state");
    const pincodeInput = document.getElementById("pincode");
    const infoSaveMessage = document.getElementById("infoSaveMessage");

    // Settings sections
    const settingsCategoryList = document.getElementById('settingsCategoryList');
    const passwordSection = document.getElementById('passwordSection');
    const notificationsSection = document.getElementById('notificationsSection');
    const languageSection = document.getElementById('languageSection');
    const bankUpiSection = document.getElementById('bankUpiSection');
    const playHistorySection = document.getElementById('playHistorySection');
    const deleteAccountSection = document.getElementById('deleteAccountSection');
    const logoutSection = document.getElementById('logoutSection');

    // Password fields
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const passwordMessage = document.getElementById('passwordMessage');

    // Notification fields
    const enableNotificationsCheckbox = document.getElementById('enableNotifications');
    const emailUpdatesCheckbox = document.getElementById('emailUpdates');
    const smsAlertsCheckbox = document.getElementById('smsAlerts');
    const notificationsMessage = document.getElementById('notificationsMessage');

    // Language field
    const languageSelect = document.getElementById('languageSelect');
    const languageMessage = document.getElementById('languageMessage');

    // Bank & UPI fields
    const bankNameInput = document.getElementById('bankName');
    const accountNumberInput = document.getElementById('accountNumber');
    const ifscCodeInput = document.getElementById('ifscCode');
    const upiIdInput = document.getElementById('upiId');
    const bankUpiMessage = document.getElementById('bankUpiMessage');

    // Play History fields
    const totalGamesPlayedDisplay = document.getElementById('totalGamesPlayed');
    const totalHoursPlayedDisplay = document.getElementById('totalHoursPlayed');
    const lastPlayedDateDisplay = document.getElementById('lastPlayedDate');
    const playHistoryMessage = document.getElementById('playHistoryMessage');

    // Delete Account fields
    const deleteConfirmationInput = document.getElementById('deleteConfirmationInput');
    const deleteConfirmationError = document.getElementById('deleteConfirmationError');
    const deleteAccountMessage = document.getElementById('deleteAccountMessage');

    // Logout fields
    const logoutMessage = document.getElementById('logoutMessage');

    // Modal elements
    const confirmationModal = document.getElementById('confirmationModal');
    const modalText = document.getElementById('modalText');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');


    // Define image paths (replace with your actual image URLs)
    const maleAvatarUrl = "../images/male.png"; // Placeholder for male.png
    const femaleAvatarUrl = "../images/female.png"; // Placeholder for female.png
    const defaultLogoUrl = "https://placehold.co/60x60/48c6ef/ffffff?text=C"; // Placeholder for logo.png

    // Data Model
    let customerProfile = {
      name: "Customer Name",
      email: "customer@example.com",
      gender: "female",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      settings: {
        enableNotifications: true,
        emailUpdates: true,
        smsAlerts: false,
        language: "en",
        bankDetails: {
          bankName: "",
          accountNumber: "",
          ifscCode: ""
        },
        upiId: "",
        playHistory: {
            totalGames: 0,
            totalHours: 0,
            lastPlayed: "N/A"
        }
      }
    };

    const LOCAL_STORAGE_KEY = "customerProfileData";
    const REGISTRATION_NAME_KEY = "registeredCustomerName";
    const REGISTRATION_EMAIL_KEY = "registeredCustomerEmail";


    // --- Functions ---

    function loadProfileData() {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        customerProfile = {
            ...customerProfile,
            ...parsedData,
            settings: {
                ...customerProfile.settings,
                ...(parsedData.settings || {}),
                bankDetails: {
                    ...customerProfile.settings.bankDetails,
                    ...((parsedData.settings && parsedData.settings.bankDetails) || {})
                },
                playHistory: {
                    ...customerProfile.settings.playHistory,
                    ...((parsedData.settings && parsedData.settings.playHistory) || {})
                }
            }
        };
      }

      // Load name and email from simulated registration
      const registeredName = localStorage.getItem(REGISTRATION_NAME_KEY);
      const registeredEmail = localStorage.getItem(REGISTRATION_EMAIL_KEY);

      if (registeredName) {
          customerProfile.name = registeredName;
      }
      if (registeredEmail) {
          customerProfile.email = registeredEmail;
      }
    }

    function saveProfileData() {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customerProfile));
      displayMessage("Profile saved successfully!", "green", null);
    }

    function renderProfileUI() {
      if (userNameElement) userNameElement.innerText = customerProfile.name;
      if (userEmailElement) userEmailElement.innerText = customerProfile.email;
      if (genderSelectElement) genderSelectElement.value = customerProfile.gender;
      updateAvatar();

      // Info tab fields
      if (phoneNumberInput) phoneNumberInput.value = customerProfile.phoneNumber;
      if (addressInput) addressInput.value = customerProfile.address;
      if (cityInput) cityInput.value = customerProfile.city;
      if (stateInput) stateInput.value = customerProfile.state;
      if (pincodeInput) pincodeInput.value = customerProfile.pincode;

      renderSettingsUI();
    }

    function updateAvatar() {
      if (genderSelectElement && avatarImgElement) {
        const selectedGender = genderSelectElement.value;
        avatarImgElement.src = selectedGender === "male" ? maleAvatarUrl : femaleAvatarUrl;
        customerProfile.gender = selectedGender;
        // No need to save to localStorage here, as it's handled by saveProfileData
      }
    }

    function showTab(tabId) {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      document.querySelector(`.tab[onclick*='${tabId}']`).classList.add("active");
      document.getElementById(tabId).classList.add("active");

      if (tabId === 'settings') {
          renderSettingsUI();
      }
    }

    function renderSettingsUI() {
        if (settingsCategoryList) settingsCategoryList.style.display = 'block';

        const sections = [passwordSection, notificationsSection, languageSection, bankUpiSection, playHistorySection, deleteAccountSection, logoutSection];
        sections.forEach(section => {
            if (section) section.style.display = 'none';
        });

        if (enableNotificationsCheckbox) enableNotificationsCheckbox.checked = customerProfile.settings.enableNotifications;
        if (emailUpdatesCheckbox) emailUpdatesCheckbox.checked = customerProfile.settings.emailUpdates;
        if (smsAlertsCheckbox) smsAlertsCheckbox.checked = customerProfile.settings.smsAlerts;
        if (languageSelect) languageSelect.value = customerProfile.settings.language;
        if (bankNameInput) bankNameInput.value = customerProfile.settings.bankDetails.bankName;
        if (accountNumberInput) accountNumberInput.value = customerProfile.settings.bankDetails.accountNumber;
        if (ifscCodeInput) ifscCodeInput.value = customerProfile.settings.bankDetails.ifscCode;
        if (upiIdInput) upiIdInput.value = customerProfile.settings.upiId;

        if (totalGamesPlayedDisplay) totalGamesPlayedDisplay.textContent = customerProfile.settings.playHistory.totalGames;
        if (totalHoursPlayedDisplay) totalHoursPlayedDisplay.textContent = customerProfile.settings.playHistory.totalHours;
        if (lastPlayedDateDisplay) lastPlayedDateDisplay.textContent = customerProfile.settings.playHistory.lastPlayed;

        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
        clearValidationError('currentPassword');
        clearValidationError('newPassword');
        clearValidationError('confirmNewPassword');

        if (deleteConfirmationInput) deleteConfirmationInput.value = '';
        clearValidationError('deleteConfirmationInput');
    }

    function showSettingSection(sectionId) {
        if (settingsCategoryList) settingsCategoryList.style.display = 'none';

        const sections = [passwordSection, notificationsSection, languageSection, bankUpiSection, playHistorySection, deleteAccountSection, logoutSection];
        sections.forEach(section => {
            if (section) section.style.display = 'none';
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    function displayMessage(message, type, element) {
        let targetElement = element;
        if (!targetElement) {
            const activeTabContent = document.querySelector('.tab-content.active');
            if (activeTabContent) {
                targetElement = activeTabContent.querySelector('p[id$="Message"]') || activeTabContent.querySelector('button').nextElementSibling;
            }
        }

        if (targetElement) {
            targetElement.textContent = message;
            targetElement.style.color = type === "error" ? "red" : "green";
            setTimeout(() => {
                targetElement.textContent = '';
            }, 3000);
        } else {
            console.log(`Message (${type}): ${message}`);
        }
    }

    function showValidationError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const inputElement = document.getElementById(fieldId);
            if (inputElement) {
                const newErrorElement = document.createElement('p');
                newErrorElement.id = fieldId + 'Error';
                newErrorElement.className = 'error-message';
                newErrorElement.textContent = message;
                inputElement.parentNode.insertBefore(newErrorElement, inputElement.nextSibling);
            }
        }
    }

    function clearValidationError(fieldId) {
        const errorElement = document.getElementById(fieldId + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    function validateField(fieldId) {
        const input = document.getElementById(fieldId);
        let isValid = true;

        if (!input) return true;

        const value = input.value.trim();

        if (input.hasAttribute('required') && value === '') {
            showValidationError(fieldId, 'This field is required.');
            isValid = false;
        }
        else if (fieldId === 'userEmailInput' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showValidationError(fieldId, 'Please enter a valid email address.');
            isValid = false;
        }
        else if (fieldId === 'phone' && value !== '' && !/^\+?[0-9\s\-()]{7,20}$/.test(value)) {
            showValidationError(fieldId, 'Please enter a valid phone number (7-20 digits, optional +).');
            isValid = false;
        }
        else if (fieldId === 'pincode' && value !== '' && !/^\d{5}(?:[-\s]\d{4})?$/.test(value)) {
            showValidationError(fieldId, 'Please enter a valid 5 or 9 digit pincode.');
            isValid = false;
        }
        else if (fieldId === 'newPassword' && value !== '' && value.length < 8) {
            showValidationError(fieldId, 'Password must be at least 8 characters long.');
            isValid = false;
        }
        else if (fieldId === 'confirmNewPassword' && newPasswordInput && value !== newPasswordInput.value) {
            showValidationError(fieldId, 'Passwords do not match.');
            isValid = false;
        }
        else if (fieldId === 'accountNumber' && value !== '' && !/^\d{9,18}$/.test(value)) {
            showValidationError(fieldId, 'Account number must be 9-18 digits.');
            isValid = false;
        }
        else if (fieldId === 'ifscCode' && value !== '' && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
            showValidationError(fieldId, 'Invalid IFSC code format (e.g., ABCD0123456).');
            isValid = false;
        }
        else if (fieldId === 'upiId' && value !== '' && !/^([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})$/.test(value)) {
            showValidationError(fieldId, 'Invalid UPI ID format (e.g., username@bankname).');
            isValid = false;
        }
        else {
            clearValidationError(fieldId);
        }
        return isValid;
    }

    function validateAndSaveInfo(event) {
        event.preventDefault(); // Prevent default form submission

        let isFormValid = true;
        const fieldsToValidate = ['phone', 'address', 'city', 'state', 'pincode']; // Corrected ID to 'phone'

        fieldsToValidate.forEach(fieldId => {
            if (!validateField(fieldId)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            customerProfile.gender = genderSelectElement.value;
            customerProfile.phoneNumber = phoneNumberInput.value.trim();
            customerProfile.address = addressInput.value.trim();
            customerProfile.city = cityInput.value.trim();
            customerProfile.state = stateInput.value.trim();
            customerProfile.pincode = pincodeInput.value.trim();
            saveProfileData();
            displayMessage('Info saved successfully!', 'green', infoSaveMessage);
        } else {
            displayMessage('Please correct the errors in Info.', 'error', infoSaveMessage);
        }
        return false; // Prevent actual form submission
    }


    function saveSpecificSettings(settingType) {
        let messageElement;
        let isValid = true;

        switch (settingType) {
            case 'password':
                messageElement = passwordMessage;
                isValid = validateField('currentPassword') && validateField('newPassword') && validateField('confirmNewPassword');
                if (isValid) {
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    confirmNewPasswordInput.value = '';
                    clearValidationError('currentPassword');
                    clearValidationError('newPassword');
                    clearValidationError('confirmNewPassword');
                }
                break;
            case 'notifications':
                messageElement = notificationsMessage;
                customerProfile.settings.enableNotifications = enableNotificationsCheckbox.checked;
                customerProfile.settings.emailUpdates = emailUpdatesCheckbox.checked;
                customerProfile.settings.smsAlerts = smsAlertsCheckbox.checked;
                break;
            case 'language':
                messageElement = languageMessage;
                customerProfile.settings.language = languageSelect.value;
                break;
            case 'bankUpi':
                messageElement = bankUpiMessage;
                isValid = validateField('bankName') && validateField('accountNumber') && validateField('ifscCode') && validateField('upiId');
                if (isValid) {
                    customerProfile.settings.bankDetails.bankName = bankNameInput.value.trim();
                    customerProfile.settings.bankDetails.accountNumber = accountNumberInput.value.trim();
                    customerProfile.settings.bankDetails.ifscCode = ifscCodeInput.value.trim();
                    customerProfile.settings.upiId = upiIdInput.value.trim();
                }
                break;
            case 'playHistory':
                messageElement = playHistoryMessage;
                customerProfile.settings.playHistory.totalGames += 1;
                customerProfile.settings.playHistory.totalHours += 0.5;
                customerProfile.settings.playHistory.lastPlayed = new Date().toLocaleDateString();

                totalGamesPlayedDisplay.textContent = customerProfile.settings.playHistory.totalGames;
                totalHoursPlayedDisplay.textContent = customerProfile.settings.playHistory.totalHours;
                lastPlayedDateDisplay.textContent = customerProfile.settings.playHistory.lastPlayed;

                displayMessage('Play statistics updated!', 'green', messageElement);
                break;
            default:
                isValid = false;
                break;
        }

        if (isValid) {
            saveProfileData();
            if (settingType !== 'playHistory') {
                displayMessage('Settings updated successfully!', 'green', messageElement);
            }
        } else {
            displayMessage('Please correct the errors.', 'error', messageElement);
        }
    }


    // Confirmation Modal Logic
    let currentModalConfirmCallback = null;

    function showConfirmationModal(message, onConfirm) {
        modalText.textContent = message;
        confirmationModal.style.display = 'flex';
        currentModalConfirmCallback = onConfirm;
    }

    modalConfirmBtn.onclick = () => {
        if (currentModalConfirmCallback) {
            currentModalConfirmCallback();
        }
        confirmationModal.style.display = 'none';
    };

    modalCancelBtn.onclick = () => {
        confirmationModal.style.display = 'none';
        currentModalConfirmCallback = null;
    };

    function confirmDeleteAccount() {
        if (deleteConfirmationInput.value === 'DELETE') {
            showConfirmationModal('Are you absolutely sure you want to delete your account? This action is irreversible.', () => {
                localStorage.clear();
                displayMessage('Account deleted. Redirecting...', 'green', deleteAccountMessage);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            });
        } else {
            showValidationError('deleteConfirmationInput', 'Please type "DELETE" to confirm.');
            displayMessage('Confirmation failed. Type "DELETE" to proceed.', 'error', deleteAccountMessage);
        }
    }

    function confirmLogout() {
        showConfirmationModal('Are you sure you want to log out?', () => {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(REGISTRATION_NAME_KEY);
            localStorage.removeItem(REGISTRATION_EMAIL_KEY);
            displayMessage('Logged out. Redirecting...', 'green', logoutMessage);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
    }


    // --- Event Listeners ---
    if (genderSelectElement) genderSelectElement.addEventListener("change", updateAvatar);
    if (phoneNumberInput) phoneNumberInput.addEventListener('input', (e) => { customerProfile.phoneNumber = e.target.value; validateField('phone'); });
    if (addressInput) addressInput.addEventListener('input', (e) => { customerProfile.address = e.target.value; });
    if (cityInput) cityInput.addEventListener('input', (e) => { customerProfile.city = e.target.value; });
    if (stateInput) stateInput.addEventListener('input', (e) => { customerProfile.state = e.target.value; });
    if (pincodeInput) pincodeInput.addEventListener('input', (e) => { customerProfile.pincode = e.target.value; validateField('pincode'); });

    // Initial load and render
    loadProfileData();
    renderProfileUI();
