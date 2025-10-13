document.addEventListener('DOMContentLoaded', () => {
    const customerDetailsDisplay = document.getElementById('customer-details');
    const lastUpdatedDisplay = document.getElementById('last-updated');
    const mapFrame = document.getElementById('map-frame');

    const urlParams = new URLSearchParams(window.location.search);
    const customerName = urlParams.get('customer_name') || 'Customer';
    const address = urlParams.get('address') || 'Address not available';

    // Display customer details
    customerDetailsDisplay.textContent = `${customerName} at ${address}`;

    // Static Google Maps embed URL for a location in Vijayawada
    const embedUrl = "http://googleusercontent.com/maps.google.com/8";

    // Set the map source and update the timestamp
    mapFrame.src = embedUrl;
    lastUpdatedDisplay.textContent = new Date().toLocaleTimeString();
});