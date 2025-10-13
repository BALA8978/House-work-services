document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const addAdminForm = document.getElementById('add-admin-form');
    const adminsTbody = document.getElementById('admins-tbody');

    async function fetchAdmins() {
        const response = await fetch('get_admins.php');
        const result = await response.json();
        adminsTbody.innerHTML = '';
        if (result.success) {
            result.data.forEach(admin => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${admin.full_name}</td><td>${admin.email}</td><td>${admin.registration_date}</td>`;
                adminsTbody.appendChild(tr);
            });
        }
    }

    addAdminForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const feedbackEl = document.getElementById('add-admin-feedback');
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('add_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, email, password })
        });
        const result = await response.json();
        feedbackEl.textContent = result.message;
        feedbackEl.className = result.success ? 'feedback success' : 'feedback error';
        if (result.success) {
            addAdminForm.reset();
            fetchAdmins();
        }
    });

    fetchAdmins();
});