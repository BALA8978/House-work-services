document.addEventListener("DOMContentLoaded", function () {
    let technicians = []; // Will hold the array of technician objects
    let currentFilters = {};

    // --- Page Section Elements ---
    const homeContent = document.getElementById('home-content');
    const searchContent = document.getElementById('search-content');
    
    // --- Navigation Buttons ---
    const homeNavBtn = document.getElementById('home-nav-btn');
    const searchNavBtn = document.getElementById('search-nav-btn');
    const findTechnicianHeroBtn = document.getElementById('find-technician-hero-btn');

    // --- Function to switch views ---
    function showView(viewToShow) {
        homeContent.classList.add('hidden');
        searchContent.classList.add('hidden');
        homeNavBtn.classList.remove('active');
        searchNavBtn.classList.remove('active');

        if (viewToShow === 'home') {
            homeContent.classList.remove('hidden');
            homeNavBtn.classList.add('active');
        } else if (viewToShow === 'search') {
            searchContent.classList.remove('hidden');
            searchNavBtn.classList.add('active');
        }
    }

    // --- Navigation Event Listeners ---
    homeNavBtn.addEventListener('click', (e) => { e.preventDefault(); showView('home'); });
    searchNavBtn.addEventListener('click', (e) => { e.preventDefault(); showView('search'); });
    findTechnicianHeroBtn.addEventListener('click', (e) => { e.preventDefault(); showView('search'); });

    // --- Main function to fetch technicians from the PHP backend ---
    function fetchTechnicians() {
        // --- THIS IS THE CORRECTED PATH ---
        // We use a root-relative path starting from the project folder.
        fetch("/House-work-services/Customers/Dashbord/get_technicians.php") 
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(result => {
                if (result.success && Array.isArray(result.data)) {
                    technicians = result.data; // Assign the array
                } else {
                    technicians = []; 
                    console.error("Backend did not return a valid technician array:", result.message);
                }
                applyFilters(); // Initial render
            })
            .catch(error => {
                console.error("Failed to load technicians:", error);
                const container = document.getElementById("technicians-list");
                container.innerHTML = "<p>Error loading technicians data. Please try again later.</p>";
            });
    }

    // --- Function to render technicians to the page ---
    function renderTechnicians(list) {
        const container = document.getElementById("technicians-list");
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = "<p>No technicians found matching your criteria.</p>";
            return;
        }

        const technicianCardsHTML = list.map(tech => {
            const services = tech.services || "No services listed";
            const availability = tech.isAvailable ? "Available" : "Not Available";
            const ratingStars = "★".repeat(Math.round(tech.rating)) + "☆".repeat(5 - Math.round(tech.rating));
            
            return `
                <div class="technician-card">
                    <h3>${tech.name} <span class="tech-id">(${tech.id})</span></h3>
                    <p><strong>Services:</strong> ${services}</p>
                    <p><strong>Rating:</strong> ${ratingStars} (${parseFloat(tech.rating).toFixed(1)})</p>
                    <p><strong>Status:</strong> ${availability}</p>
                    <button class="btn btn-primary book-btn" onclick="location.href='../calendar-and-booking/index.html?technician_id=${tech.id}'">Book Now</button>
                </div>
            `;
        }).join('');
        container.innerHTML = technicianCardsHTML;
    }

    // --- Filtering logic ---
    function filterTechnicians(list, filters) {
        return list.filter(tech => {
            const searchTermMatch = !filters.searchTerm || 
                (tech.name && tech.name.toLowerCase().includes(filters.searchTerm)) || 
                (tech.services && tech.services.toLowerCase().includes(filters.searchTerm));
            const idMatch = !filters.technicianId || (tech.id && tech.id.toLowerCase().includes(filters.technicianId));
            const serviceTypeMatch = !filters.serviceType || (tech.services && tech.services.toLowerCase().includes(filters.serviceType));
            const minPriceMatch = !filters.minPrice || tech.price >= filters.minPrice;
            const maxPriceMatch = !filters.maxPrice || tech.price <= filters.maxPrice;
            const minRatingMatch = !filters.minRating || tech.rating >= filters.minRating;
            const minExperienceMatch = !filters.minExperience || tech.experience >= filters.minExperience;
            const availabilityMatch = !filters.availability || tech.isAvailable;
            return searchTermMatch && idMatch && serviceTypeMatch && minPriceMatch && maxPriceMatch && minRatingMatch && minExperienceMatch && availabilityMatch;
        });
    }
    
    // --- Gathers filter values and applies them ---
    function applyFilters() {
        const searchTerm = document.getElementById("search-bar")?.value.trim().toLowerCase() || "";
        currentFilters = {
            searchTerm: searchTerm,
            technicianId: document.getElementById("technician-id-filter")?.value.trim().toLowerCase() || "",
            serviceType: document.getElementById("service-type-filter")?.value.toLowerCase() || "",
            minPrice: parseInt(document.getElementById("min-price")?.value, 10) || null,
            maxPrice: parseInt(document.getElementById("max-price")?.value, 10) || null,
            minRating: parseFloat(document.getElementById("rating-filter")?.value) || null,
            minExperience: parseInt(document.getElementById("min-exp")?.value, 10) || null,
            availability: document.getElementById("availability-filter")?.checked || false,
        };

        const filtered = filterTechnicians(technicians, currentFilters);
        renderTechnicians(filtered);
    }

    // --- Modal Handling ---
    const modal = document.getElementById("filters-modal");
    const filterBtn = document.getElementById("filter-btn");
    const closeBtn = document.getElementById("close-filters");
    const applyBtn = document.getElementById("apply-filters");

    if (filterBtn) filterBtn.addEventListener("click", () => modal.classList.add("show"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("show"));
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            applyFilters();
            modal.classList.remove("show");
        });
    }

    // --- Event Listener for live search ---
    const searchBar = document.getElementById("search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", applyFilters);
    }

    // --- Initial Setup ---
    showView('home'); // Show the home content by default
    fetchTechnicians(); // Fetch technician data in the background
});