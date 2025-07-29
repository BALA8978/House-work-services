let technicians = []; // Will hold data fetched from backend API
let currentFilters = {};


// --- Filtering logic ---
function filterTechnicians(list, filters) {
  return list.filter((tech) => {
    // Search by name/services
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      if (
        !tech.name.toLowerCase().includes(term) &&
        !tech.services.some((s) => s.toLowerCase().includes(term))
      ) {
        return false;
      }
    }
    // Technician ID
    if (filters.technicianId) {
      const idTerm = filters.technicianId.trim().toLowerCase();
      if (!tech.id.toLowerCase().includes(idTerm)) {
        return false;
      }
    }
    // Service type
    if (
      filters.serviceType &&
      filters.serviceType !== "all" &&
      filters.serviceType !== "" &&
      !tech.services.includes(filters.serviceType)
    )
      return false;
    // Price range
    if (filters.minPrice !== undefined && tech.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && tech.price > filters.maxPrice) return false;
    // Rating
    if (filters.minRating !== undefined && tech.rating < filters.minRating) return false;
    // Experience
    if (filters.minExperience !== undefined && tech.experience < filters.minExperience) return false;
    // Availability
    if (filters.availability && !tech.isAvailable) return false;

    return true;
  });
}


// --- Render technicians ---
function renderTechnicians(list) {
  const container = document.getElementById("technicians-list");
  if (list.length === 0) {
    container.innerHTML = "<p>No technicians found.</p>";
    return;
  }

  const technicianCardsHTML = list.map(tech => {
    const services = tech.services.join(", ");
    const availability = tech.isAvailable ? "Available" : "Not Available";
    const ratingStars = "★".repeat(Math.round(tech.rating)) + "☆".repeat(5 - Math.round(tech.rating));

    return `
      <div class="technician-card">
      <h3>${tech.name} <span class="tech-id">(${tech.id})</span></h3>
      <p>Availability: <strong>${availability}</strong></p>
      <p>Rating: ${ratingStars} (${tech.rating.toFixed(1)})</p>
      <p>Experience: ${tech.experience} years</p>
      <p>Services: ${services}</p>
      <p>Cost: ₹${tech.price}</p>
      <button class="contact-btn" aria-label="Contact ${tech.name} technician">Contact</button>
      <button class="book-btn" aria-label="Book ${tech.name} technician" onclick="location.href='localhost/House-work-services/calendar and booking/index.html?tech_id=${tech.id}'">Book</button>
      </div>
    `;
  }).join('');

  container.innerHTML = technicianCardsHTML;
}


// --- Apply filters function ---
function applyFilters() {
  currentFilters = {
    searchTerm: document.getElementById("search-bar")?.value.trim() || "",
    technicianId: document.getElementById("technician-id-filter")?.value.trim() || "",
    serviceType: document.getElementById("service-type-filter")?.value || "all",
    minPrice: parseInt(document.getElementById("min-price")?.value, 10),
    maxPrice: parseInt(document.getElementById("max-price")?.value, 10),
    minRating: parseFloat(document.getElementById("rating-filter")?.value),
    minExperience: parseInt(document.getElementById("min-exp")?.value, 10),
    availability: document.getElementById("availability-filter")?.checked || false,
  };

  // Convert NaN to undefined for number filters for correct filtering logic
  if (isNaN(currentFilters.minPrice)) currentFilters.minPrice = undefined;
  if (isNaN(currentFilters.maxPrice)) currentFilters.maxPrice = undefined;
  if (isNaN(currentFilters.minRating)) currentFilters.minRating = undefined;
  if (isNaN(currentFilters.minExperience)) currentFilters.minExperience = undefined;

  const filtered = filterTechnicians(technicians, currentFilters);
  renderTechnicians(filtered);
}


// --- Fetch technicians from PHP backend API ---
function fetchTechnicians() {
  fetch("http://localhost/api/get_technicians.php")
    .then((response) => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! Status: ${response.status}. Response: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      technicians = data;
      applyFilters();
    })
    .catch((error) => {
      console.error("Failed to load technicians:", error);
      const container = document.getElementById("technicians-list");
      container.innerHTML = "<p>Error loading technicians data. Please try again later.</p>";
      if (error.message.includes("Response:")) {
        container.innerHTML += `<p>Debug Info: ${error.message}</p>`;
      }
    });
}


// --- Setup event listeners and initialize ---
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("filters-modal");
  if (modal) {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");

    const filterBtn = document.getElementById("filter-btn");
    if (filterBtn) {
      filterBtn.addEventListener("click", function () {
        modal.classList.add("show");
        document.body.classList.add("modal-open");
        const serviceTypeInput = document.getElementById("service-type-filter");
        if (serviceTypeInput) serviceTypeInput.focus();
      });
    }

    const closeBtn = document.getElementById("close-filters");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
      });
    }

    const applyBtn = document.getElementById("apply-filters");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        applyFilters();
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
      });
    }
  }

  // Real-time search input event
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.addEventListener("input", applyFilters);
  }

  // Initial fetch of technicians from backend
  fetchTechnicians();
});
