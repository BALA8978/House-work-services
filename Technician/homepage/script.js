document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Elements ---
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    // --- Event Listener for Navigation Buttons ---
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'active' class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            this.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.add('hidden'));

            // Show the corresponding content section
            const targetId = this.id.replace('-nav-btn', '-content');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
});