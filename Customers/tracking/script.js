document.addEventListener('DOMContentLoaded', () => {
    const technicianNameDisplay = document.getElementById('technician-name');
    const lastUpdatedDisplay = document.getElementById('last-updated');
    const updateLocationBtn = document.getElementById('update-location-btn');
    const mapFrame = document.getElementById('map-frame');

    // Get technician name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const technicianName = urlParams.get('technician') || 'Your Technician';
    technicianNameDisplay.textContent = technicianName;

    // Array of Google Maps embed URLs for different locations in Vijayawada
    const embedUrls = [
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.498563795394!2d80.6455558148642!3d16.50616998862349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fab954247509%3A0x86759711f58597a7!2sVijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1678886473216!5m2!1sen!2sin",
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15302.839846465801!2d80.6222!3d16.5189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fa1f97376c97%3A0x6760b2490b4d45b5!2sBenz%20Circle%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1678886543210!5m2!1sen!2sin",
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15302.26058533316!2d80.6333!3d16.495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fa1479854839%3A0x8d5c58a36c612b05!2sBesant%20Rd%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1678886589123!5m2!1sen!2sin",
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15300.91350993684!2d80.612!3d16.5435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fb1a0c44445d%3A0x6a1e3e7f677f59e!2sGunadala%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1678886621456!5m2!1sen!2sin"
    ];

    function updateLocation() {
        // Pick a random embed URL from the array
        const randomUrl = embedUrls[Math.floor(Math.random() * embedUrls.length)];

        // Update the map iframe's src attribute
        mapFrame.src = randomUrl;

        // Update the timestamp
        lastUpdatedDisplay.textContent = new Date().toLocaleTimeString();
    }

    // Add event listener to the button
    updateLocationBtn.addEventListener('click', updateLocation);

    // Set the initial location when the page loads
    updateLocation();
});