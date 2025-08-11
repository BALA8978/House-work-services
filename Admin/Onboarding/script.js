document.addEventListener('DOMContentLoaded', function() {
    fetchOnboardingRequests();
});

function fetchOnboardingRequests() {
    fetch('get_onboarding_requests.php')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('onboarding-list');
            list.innerHTML = '';
            if (data.success) {
                data.data.forEach(request => {
                    const card = document.createElement('div');
                    card.className = 'bg-white p-5 rounded-lg shadow-md';
                    card.innerHTML = `
                        <h2 class="text-xl font-bold">${request.full_name}</h2>
                        <p><strong>Email:</strong> ${request.email}</p>
                        <p><strong>Skills:</strong> ${request.skills}</p>
                        <div class="mt-4">
                            <button onclick="approve(${request.user_id})" class="bg-green-500 text-white px-4 py-2 rounded-md">Approve</button>
                            <button onclick="reject(${request.user_id})" class="bg-red-500 text-white px-4 py-2 rounded-md">Reject</button>
                        </div>
                    `;
                    list.appendChild(card);
                });
            } else {
                list.innerHTML = `<p>${data.message}</p>`;
            }
        });
}

function approve(userId) {
    updateStatus(userId, 'approved');
}

function reject(userId) {
    updateStatus(userId, 'rejected');
}

function updateStatus(userId, status) {
    fetch('update_onboarding_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchOnboardingRequests();
        } else {
            alert(data.message);
        }
    });
}