// File: /Customers/Dashbord/script.js (Corrected)

document.addEventListener('DOMContentLoaded', function() {
    const technicianListContainer = document.getElementById('technician-list');
    const searchInput = document.getElementById('search-input');
    let allTechnicians = []; // This will store the master list of technicians from the server.

    // --- 1. FUNCTION TO FETCH AND DISPLAY TECHNICIANS ---
    async function fetchAndDisplayTechnicians() {
        try {
            const response = await fetch('get_technicians.php');
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                allTechnicians = result.data; // Store the fetched array
                if (allTechnicians.length > 0) {
                    displayTechnicians(allTechnicians); // Display the full list initially
                } else {
                    technicianListContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No available technicians found at the moment.</p>';
                }
            } else {
                // Handle cases where fetching was not successful or data is not an array
                allTechnicians = []; // Ensure it's an empty array on failure
                technicianListContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">${result.message || 'Could not load technicians.'}</p>`;
            }
        } catch (error) {
            console.error("Error fetching technicians:", error);
            allTechnicians = [];
            technicianListContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">An error occurred while fetching data. Please try again later.</p>';
        }
    }

    // --- 2. FUNCTION TO RENDER THE TECHNICIAN CARDS ---
    function displayTechnicians(technicians) {
        technicianListContainer.innerHTML = ''; // Clear previous results

        if (technicians.length === 0) {
            technicianListContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No technicians match your search.</p>';
            return;
        }

        technicians.forEach(tech => {
            const techCard = document.createElement('div');
            techCard.className = 'technician-card bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow';

            // Determine avatar based on gender, defaulting to male if not specified
            const avatarSrc = tech.gender === 'Female' 
                ? '../login/Photos/female.png' 
                : '../login/Photos/male.png';

            techCard.innerHTML = `
                <div class="flex items-center mb-4">
                    <img src="${avatarSrc}" alt="${tech.name}" class="w-16 h-16 rounded-full mr-4 border-2 border-blue-500">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${tech.name}</h3>
                        <div class="flex items-center text-yellow-500">
                            <i class="fas fa-star"></i>
                            <span class="ml-1 font-semibold">${parseFloat(tech.rating).toFixed(1)}</span>
                            <span class="text-gray-600 ml-2">(${tech.experience} years exp.)</span>
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-700">Services:</h4>
                    <p class="text-gray-600">${tech.services}</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-lg font-bold text-blue-600">₹${tech.price}/hr</p>
                    <a href="../calendar-and-booking/index.html?technician_id=${tech.id}" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors">
                        Book Now
                    </a>
                </div>
            `;
            technicianListContainer.appendChild(techCard);
        });
    }

    // --- 3. SEARCH/FILTER FUNCTIONALITY ---
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // --- THIS IS THE CORRECTED LOGIC ---
        // We filter the 'allTechnicians' array, which is the correct data source.
        const filteredTechnicians = allTechnicians.filter(tech => 
            (tech.name && tech.name.toLowerCase().includes(searchTerm)) || 
            (tech.services && tech.services.toLowerCase().includes(searchTerm))
        );
        
        displayTechnicians(filteredTechnicians);
    });

    // --- INITIAL LOAD ---
    fetchAndDisplayTechnicians();
});