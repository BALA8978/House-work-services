document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const technicianNameDisplay = document.getElementById('technicianName');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessagesContainer = document.getElementById('chat-messages');

    // --- Pre-fill technician name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const technicianName = urlParams.get('technician');

    if (technicianName) {
        technicianNameDisplay.textContent = technicianName;
    }

    // --- Function to add a message to the chat window ---
    function addMessage(message, type) {
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${type}`; // 'sent' or 'received'
        messageBubble.textContent = message;
        chatMessagesContainer.appendChild(messageBubble);

        // Scroll to the bottom of the chat
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- Function to handle sending a message ---
    function sendMessage() {
        const messageText = messageInput.value.trim();

        if (messageText) {
            // Display the sent message
            addMessage(messageText, 'sent');

            // Clear the input field
            messageInput.value = '';

            // Simulate a reply from the technician after a short delay
            setTimeout(() => {
                const reply = `Hi! This is ${technicianName || 'your technician'}. I've received your message and will get back to you shortly.`;
                addMessage(reply, 'received');
            }, 1500);
        }
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // --- Initial welcome message ---
    setTimeout(() => {
         addMessage('Welcome! How can I help you today?', 'received');
    }, 500);
});