document.addEventListener("DOMContentLoaded", function () {
    let technicians = []; // Will hold data fetched from the backend
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
        // Hide all views first
        homeContent.classList.add('hidden');
        searchContent.classList.add('hidden');

        // Deactivate all nav buttons
        homeNavBtn.classList.remove('active');
        searchNavBtn.classList.remove('active');

        // Show the selected view and activate its button
        if (viewToShow === 'home') {
            homeContent.classList.remove('hidden');
            homeNavBtn.classList.add('active');
        } else if (viewToShow === 'search') {
            searchContent.classList.remove('hidden');
            searchNavBtn.classList.add('active');
        }
    }

    // --- Navigation Event Listeners ---
    homeNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showView('home');
    });

    searchNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showView('search');
    });

    findTechnicianHeroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showView('search');
    });

    // --- Main function to fetch technicians from the PHP backend ---
    function fetchTechnicians() {
        // Assuming get_technicians.php is in a shared backend folder
        fetch("../get_technicians.php") 
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                technicians = data;
                applyFilters(); // Initial render of all technicians
            })
            .catch(error => {
                console.error("Failed to load technicians:", error);
                const container = document.getElementById("technicians-list");
                container.innerHTML = "<p>Error loading technicians data. Please try again later.</p>";
            });
    }

    // --- Function to render technicians to the page (with the fix) ---
    function renderTechnicians(list) {
        const container = document.getElementById("technicians-list");
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = "<p>No technicians found matching your criteria.</p>";
            return;
        }

        const technicianCardsHTML = list.map(tech => {
            // Ensure services is an array before joining
            const services = Array.isArray(tech.services) ? tech.services.join(", ") : "No services listed";
            const availability = tech.isAvailable ? "Available" : "Not Available";
            const ratingStars = "★".repeat(Math.round(tech.rating)) + "☆".repeat(5 - Math.round(tech.rating));
            
            // The fix is in the button's onclick attribute below.
            // It now correctly constructs a clean URL with the technician's ID.
            
            return `
                <div class="technician-card">
                    <h3>${tech.name} <span class="tech-id">(${tech.id})</span></h3>
                    <p><strong>Services:</strong> ${services}</p>
                    <p><strong>Rating:</strong> ${ratingStars} (${parseFloat(tech.rating).toFixed(1)})</p>
                    <p><strong>Status:</strong> ${availability}</p>
                    <button class="btn btn-primary book-btn" onclick="location.href='../../calendar-and-booking/index.html?technician_id=${tech.id}'">Book Now</button>
                </div>
            `;
        }).join('');
        container.innerHTML = technicianCardsHTML;
    }

    // --- Filtering logic ---
    function filterTechnicians(list, filters) {
        return list.filter(tech => {
            if (filters.searchTerm && ! (tech.name.toLowerCase().includes(filters.searchTerm) || (Array.isArray(tech.services) && tech.services.some(s => s.toLowerCase().includes(filters.searchTerm))))) return false;
            if (filters.technicianId && !tech.id.toLowerCase().includes(filters.technicianId)) return false;
            if (filters.serviceType && (!Array.isArray(tech.services) || !tech.services.includes(filters.serviceType))) return false;
            if (filters.minPrice && tech.price < filters.minPrice) return false;
            if (filters.maxPrice && tech.price > filters.maxPrice) return false;
            if (filters.minRating && tech.rating < filters.minRating) return false;
            if (filters.minExperience && tech.experience < filters.minExperience) return false;
            if (filters.availability && !tech.isAvailable) return false;
            return true;
        });
    }

    // --- Gathers filter values and applies them ---
    function applyFilters() {
        const searchTerm = document.getElementById("search-bar")?.value.trim().toLowerCase() || "";
        currentFilters = {
            searchTerm: searchTerm,
            technicianId: document.getElementById("technician-id-filter")?.value.trim().toLowerCase() || "",
            serviceType: document.getElementById("service-type-filter")?.value || "",
            minPrice: parseInt(document.getElementById("min-price")?.value, 10) || undefined,
            maxPrice: parseInt(document.getElementById("max-price")?.value, 10) || undefined,
            minRating: parseFloat(document.getElementById("rating-filter")?.value) || undefined,
            minExperience: parseInt(document.getElementById("min-exp")?.value, 10) || undefined,
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