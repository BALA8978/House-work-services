document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Elements ---
    const modal = document.getElementById('authModal');
    const signInBtn = document.getElementById('signInBtn');
    const closeBtn = modal.querySelector('.close-btn');
    
    // --- Form Elements ---
    const authForm = document.getElementById('authForm');
    const roleBtns = modal.querySelectorAll('.role-btn');
    const selectedRoleInput = document.getElementById('selectedRole');
    const emailInput = authForm.querySelector('input[type="email"]');
    const passwordInput = authForm.querySelector('input[type="password"]');
    const submitButton = authForm.querySelector('button[type="submit"]');

    // --- Create a dedicated element for server responses inside the modal ---
    let responseMessageEl = modal.querySelector('.response-message');
    if (!responseMessageEl) {
        responseMessageEl = document.createElement('p');
        responseMessageEl.className = 'response-message';
        authForm.parentNode.insertBefore(responseMessageEl, authForm.nextSibling);
    }
    responseMessageEl.style.textAlign = 'center';
    responseMessageEl.style.marginTop = '15px';
    responseMessageEl.style.fontWeight = '600';
    responseMessageEl.style.minHeight = '24px';

    // --- Functions to open/close modal ---
    const openModal = () => { 
        modal.style.display = 'block'; 
        responseMessageEl.textContent = '';
        authForm.reset();
        roleBtns.forEach(btn => btn.classList.remove('active'));
        authForm.querySelector('.role-btn[data-role="Customer"]').classList.add('active');
        selectedRoleInput.value = 'Customer';
    };
    const closeModal = () => { modal.style.display = 'none'; };

    // --- Event Listeners ---
    signInBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    roleBtns.forEach(button => {
        button.addEventListener('click', () => {
            roleBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedRoleInput.value = button.dataset.role;
        });
    });

    // --- Handle Sign-In Form submission with Fetch API ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.textContent = 'Signing In...';
        responseMessageEl.textContent = '';

        const data = {
            role: selectedRoleInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            // --- CORRECTION HERE ---
            // The path is now '../api/login.php' to correctly go up one directory
            // from 'homepage' and then into the 'api' folder.
            const response = await fetch('../api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            responseMessageEl.textContent = result.message;

            if (response.ok && result.status === 'success') {
                responseMessageEl.style.color = 'green';
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } else {
                responseMessageEl.style.color = 'red';
            }

        } catch (error) {
            console.error('Login Error:', error);
            responseMessageEl.style.color = 'red';
            responseMessageEl.textContent = 'An unexpected network error occurred. Please try again.';
        } finally {
            if (responseMessageEl.style.color === 'red') {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        }
    });
});
