document.addEventListener("DOMContentLoaded", function () {
    let technicians = []; // Will hold data fetched from the backend
    
    // --- Navigation and View Switching ---
    const homeContent = document.getElementById('home-content');
    const searchContent = document.getElementById('search-content');
    const homeNavBtn = document.getElementById('home-nav-btn');
    const searchNavBtn = document.getElementById('search-nav-btn');
    const findTechnicianHeroBtn = document.getElementById('find-technician-hero-btn');

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

    homeNavBtn.addEventListener('click', () => showView('home'));
    searchNavBtn.addEventListener('click', () => showView('search'));
    findTechnicianHeroBtn.addEventListener('click', () => showView('search'));

    // --- Main function to fetch technicians ---
    function fetchTechnicians() {
        fetch("get_technicians.php")
            .then(response => response.json())
            .then(data => {
                technicians = data;
                applyFilters();
            })
            .catch(error => console.error("Failed to load technicians:", error));
    }

    // --- Renders technician cards to the page ---
    function renderTechnicians(list) {
        const container = document.getElementById("technicians-list");
        if (list.length === 0) {
            container.innerHTML = "<p>No technicians found.</p>";
            return;
        }
        const technicianCardsHTML = list.map(tech => {
            const services = tech.services ? tech.services.join(", ") : 'N/A';
            const availability = tech.isAvailable ? "Available" : "Not Available";
            const ratingStars = "★".repeat(Math.round(tech.rating)) + "☆".repeat(5 - Math.round(tech.rating));
            
            // Corrected link to the new calendar booking page
            const bookingUrl = `../calendar-and-booking/index.html?technician_id=${tech.id}`;

            return `
              <div class="technician-card">
                <h3>${tech.name}</h3>
                <p><strong>Services:</strong> ${services}</p>
                <p><strong>Rating:</strong> ${ratingStars} (${tech.rating})</p>
                <p><strong>Status:</strong> ${availability}</p>
                <button class="btn btn-primary book-btn" onclick="location.href='${bookingUrl}'">Book Now</button>
              </div>`;
        }).join('');
        container.innerHTML = technicianCardsHTML;
    }

    // --- Filtering logic ---
    function applyFilters() {
        const searchTerm = document.getElementById("search-bar").value.trim().toLowerCase();
        const filtered = technicians.filter(tech => {
             const nameMatch = tech.name.toLowerCase().includes(searchTerm);
             const serviceMatch = tech.services && tech.services.some(s => s.toLowerCase().includes(searchTerm));
             return nameMatch || serviceMatch;
        });
        renderTechnicians(filtered);
    }

    // --- Event Listeners ---
    document.getElementById("search-bar").addEventListener("input", applyFilters);

    // --- Initial Load ---
    showView('home');
    fetchTechnicians();
});