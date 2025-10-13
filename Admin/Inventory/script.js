document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const stockListEl = document.getElementById('stock-levels-list');
    const addItemForm = document.getElementById('add-item-form');
    const itemRequestsListEl = document.getElementById('item-requests-list');

    async function fetchStockLevels() {
        const response = await fetch('get_stock_levels.php');
        const result = await response.json();
        stockListEl.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.innerHTML = `
                    <h3>${item.item_name}</h3>
                    <p>${item.item_description || ''}</p>
                    <p><strong>Stock:</strong> ${item.total_quantity || 0} ${item.stock_unit}</p>
                `;
                stockListEl.appendChild(itemDiv);
            });
        } else {
            stockListEl.innerHTML = `<p>No stock items found.</p>`;
        }
    }

    async function fetchItemRequests() {
        const response = await fetch('get_item_requests.php');
        const result = await response.json();
        itemRequestsListEl.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(request => {
                const requestDiv = document.createElement('div');
                requestDiv.innerHTML = `
                    <h3>${request.item_name}</h3>
                    <p><strong>Requested by:</strong> ${request.technician_name}</p>
                    <p><strong>Reason:</strong> ${request.reason}</p>
                    <div>
                        <button onclick="updateRequestStatus(${request.request_id}, 'Approved')" class="btn btn-approve">Approve</button>
                        <button onclick="updateRequestStatus(${request.request_id}, 'Rejected')" class="btn btn-reject">Reject</button>
                    </div>
                `;
                itemRequestsListEl.appendChild(requestDiv);
            });
        } else {
            itemRequestsListEl.innerHTML = `<p>No pending item requests.</p>`;
        }
    }

    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackEl = document.getElementById('add-item-feedback');
        const formData = new FormData(addItemForm);

        const response = await fetch('add_new_item.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        feedbackEl.textContent = result.message;
        feedbackEl.className = result.success ? 'feedback success' : 'feedback error';

        if (result.success) {
            addItemForm.reset();
            fetchStockLevels();
        }
    });
    
    window.updateRequestStatus = async function(requestId, status) {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;

        const response = await fetch('update_request_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId, status: status })
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) {
            fetchItemRequests();
        }
    }

    fetchStockLevels();
    fetchItemRequests();
});