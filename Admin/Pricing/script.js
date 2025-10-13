document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const servicesTbody = document.getElementById('services-tbody');
    const feedbackEl = document.getElementById('pricing-feedback');

    async function fetchServices() {
        try {
            const response = await fetch('get_services.php');
            const result = await response.json();
            servicesTbody.innerHTML = '';
            if (result.success) {
                result.data.forEach(service => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${service.service_name}</td>
                        <td>${parseFloat(service.base_price).toFixed(2)}</td>
                        <td><input type="number" min="0" step="0.01" class="price-input" value="${parseFloat(service.base_price).toFixed(2)}"></td>
                        <td><button class="btn btn-primary" onclick="updatePrice(${service.service_id}, this)">Update</button></td>
                    `;
                    servicesTbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            servicesTbody.innerHTML = '<tr><td colspan="4">Could not load services.</td></tr>';
        }
    }

    window.updatePrice = async function(serviceId, button) {
        const input = button.closest('tr').querySelector('.price-input');
        const newPrice = input.value;

        if (!newPrice || newPrice < 0) {
            alert('Please enter a valid price.');
            return;
        }

        try {
            const response = await fetch('update_price.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: serviceId, new_price: newPrice })
            });
            const result = await response.json();

            feedbackEl.textContent = result.message;
            feedbackEl.className = result.success ? 'feedback success' : 'feedback error';

            if (result.success) {
                fetchServices(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating price:', error);
            feedbackEl.textContent = 'An unexpected error occurred.';
            feedbackEl.className = 'feedback error';
        }
    };

    fetchServices();
});