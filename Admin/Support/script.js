document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar
    fetch('../sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;
        });

    const ticketList = document.getElementById('ticket-list');

    async function fetchSupportTickets() {
        try {
            const response = await fetch('get_support_tickets.php');
            const result = await response.json();

            ticketList.innerHTML = '';
            if (result.success && result.data.length > 0) {
                result.data.forEach(ticket => {
                    const ticketCard = document.createElement('div');
                    ticketCard.className = 'ticket-card';
                    const statusClass = ticket.status.toLowerCase().replace(' ', '-');

                    ticketCard.innerHTML = `
                        <div class="ticket-header">
                            <h3>${ticket.subject}</h3>
                            <span class="status-tag ${statusClass}">${ticket.status}</span>
                        </div>
                        <div class="ticket-body">
                            <p><strong>From:</strong> ${ticket.customer_name}</p>
                            <p><strong>Booking ID:</strong> ${ticket.booking_id || 'N/A'}</p>
                            <p><strong>Submitted:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
                            <p><strong>Description:</strong><br>${ticket.description}</p>
                        </div>
                        <div class="ticket-footer form-group">
                            <label for="status-select-${ticket.ticket_id}">Update Status:</label>
                            <select id="status-select-${ticket.ticket_id}" class="status-select" onchange="updateTicketStatus(${ticket.ticket_id}, this.value)">
                                <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                                <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </div>
                    `;
                    ticketList.appendChild(ticketCard);
                });
            } else {
                ticketList.innerHTML = '<div class="card"><p>No support tickets found.</p></div>';
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketList.innerHTML = '<div class="card"><p>Could not load support tickets.</p></div>';
        }
    }

    window.updateTicketStatus = async function(ticketId, status) {
        try {
            const response = await fetch('update_ticket_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_id: ticketId, status: status })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchSupportTickets();
            }
        } catch (error) {
            alert('An error occurred while updating the status.');
            console.error('Update error:', error);
        }
    }

    fetchSupportTickets();
});