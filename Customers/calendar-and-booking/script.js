document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const technicianNameDisplay = document.getElementById('technicianName');
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const dateMessage = document.getElementById('dateMessage');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const noSlotsMessage = document.getElementById('noSlotsMessage');
    const bookingForm = document.getElementById('bookingForm');
    const confirmTechName = document.getElementById('confirmTechName');
    const confirmBookingDate = document.getElementById('confirmBookingDate');
    const confirmBookingTime = document.getElementById('confirmBookingTime');
    const serviceDescriptionInput = document.getElementById('serviceDescription');
    const bookingMessage = document.getElementById('bookingMessage');

    // --- State Variables ---
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let selectedTime = null;
    let technicianId = null;
    let technicianDetails = {}; // To store name and other details
    let bookedSlots = []; // Stores dates/times that are already booked for the technician
    let unavailablePeriods = []; // Stores periods technician is explicitly unavailable

    // --- Helper Functions ---

    // Function to parse technician_id from URL
    function getTechnicianIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('technician_id');
    }

    // Function to fetch technician details (e.g., name)
    async function fetchTechnicianDetails(id) {
        try {
            const response = await fetch(`../Dashbord/get_technicians.php?id=${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data && data.length > 0) {
                technicianDetails = data[0];
                technicianNameDisplay.textContent = technicianDetails.name;
                confirmTechName.textContent = technicianDetails.name;
            } else {
                technicianNameDisplay.textContent = 'Unknown Technician';
                confirmTechName.textContent = 'Unknown Technician';
                alert('Technician details not found.');
            }
        } catch (error) {
            console.error('Error fetching technician details:', error);
            technicianNameDisplay.textContent = 'Error Loading';
            confirmTechName.textContent = 'Error Loading';
        }
    }

    // Function to fetch technician's booked slots AND unavailability
    async function fetchTechnicianCalendarData(techId) {
        try {
            const response = await fetch(`get_technician_availability.php?technician_id=${techId}`);
            if (!response.ok) throw new Error('Network response for availability not ok');
            const data = await response.json();
            if (data.success) {
                bookedSlots = data.booked_slots; // Array of {booking_date: "YYYY-MM-DD", booking_time: "HH:MM:SS"}
                unavailablePeriods = data.unavailable_periods.map(period => ({
                    start: new Date(period.start_datetime),
                    end: new Date(period.end_datetime),
                    reason: period.reason
                }));
                renderCalendar(currentMonth, currentYear); // Re-render calendar to show updated availability
                if (selectedDate) { // If a date is already selected, re-render its time slots
                    renderTimeSlots();
                }
            } else {
                console.error('Error fetching calendar data:', data.message);
                bookedSlots = [];
                unavailablePeriods = [];
            }
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
            bookedSlots = [];
            unavailablePeriods = [];
        }
    }

    // Generate calendar days
    function renderCalendar(month, year) {
        calendarGrid.innerHTML = '';
        currentMonthYearDisplay.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0,0,0,0); // Normalize today to start of day

        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = day;
            const fullDate = new Date(year, month, day);
            dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Check if day is in the past
            if (fullDate < today) {
                dayDiv.classList.add('empty'); // Mark past days as not selectable
                dayDiv.style.cursor = 'not-allowed';
            } else {
                dayDiv.addEventListener('click', () => selectDate(dayDiv));
            }

            // Mark current day
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayDiv.classList.add('current-day');
            }

            // Check if this day has any booked slots or full unavailability for the technician
            const hasBookingOnThisDay = bookedSlots.some(slot => {
                const slotDate = new Date(slot.booking_date);
                return slotDate.getFullYear() === year && slotDate.getMonth() === month && slotDate.getDate() === day;
            });

            // Check if this entire day falls within any unavailable period
            const isDayFullyUnavailable = unavailablePeriods.some(period => {
                // Check if the current day is within or encompasses the unavailable period
                return fullDate >= new Date(period.start.getFullYear(), period.start.getMonth(), period.start.getDate()) &&
                       fullDate <= new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate());
            });

            if (hasBookingOnThisDay || isDayFullyUnavailable) {
                dayDiv.classList.add('has-bookings'); // Use this class for any kind of reduced availability
            }

            // Mark selected date
            if (selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day) {
                dayDiv.classList.add('selected');
            }

            calendarGrid.appendChild(dayDiv);
        }
    }

    // Handle date selection
    function selectDate(dayDiv) {
        if (dayDiv.classList.contains('empty') && !dayDiv.classList.contains('has-bookings')) {
            // Do not allow selection of past/empty days unless they are marked as having bookings
            return;
        }

        // Clear previous selection
        const previouslySelected = document.querySelector('.calendar-day.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        selectedDate = new Date(dayDiv.dataset.date);
        dayDiv.classList.add('selected');

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
        confirmBookingDate.textContent = selectedDate.toLocaleDateString('en-US', options);

        dateMessage.style.display = 'none'; // Hide initial message
        renderTimeSlots(); // Show time slots for selected date
        bookingForm.style.display = 'none'; // Hide form until time is selected
        bookingMessage.textContent = ''; // Clear previous messages
        selectedTime = null; // Reset selected time
    }

    // Render available and booked time slots
    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        noSlotsMessage.style.display = 'none';

        // Example standard time slots (you can get these from backend too)
        const allPossibleSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
        ];

        const selectedDateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

        let hasActuallyAvailableSlots = false;
        allPossibleSlots.forEach(slot => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('time-slot');
            timeSlotDiv.textContent = slot;
            timeSlotDiv.dataset.time = slot;

            const slotDateTime = new Date(`${selectedDateString}T${convertTo24Hour(slot)}`);

            // Check if this specific slot is booked for the selected technician and date
            const isBooked = bookedSlots.some(bookedSlot => {
                const bookedDate = bookedSlot.booking_date; // YYYY-MM-DD
                const bookedTime = formatTimeForComparison(bookedSlot.booking_time); // HH:MM AM/PM
                return bookedDate === selectedDateString && bookedTime === slot;
            });

            // Check if this slot falls within any explicit unavailable period
            const isExplicitlyUnavailable = unavailablePeriods.some(period => {
                return slotDateTime >= period.start && slotDateTime < period.end;
            });

            if (isBooked) {
                timeSlotDiv.classList.add('booked');
                timeSlotDiv.dataset.status = 'booked';
                timeSlotDiv.title = 'This slot is already booked.';
            } else if (isExplicitlyUnavailable) {
                timeSlotDiv.classList.add('booked'); // Use 'booked' class for visual consistency for unavailability
                timeSlotDiv.dataset.status = 'unavailable';
                timeSlotDiv.title = `Technician unavailable: ${unavailablePeriods.find(p => slotDateTime >= p.start && slotDateTime < p.end)?.reason || 'Reason not specified'}`;
            } else if (slotDateTime < new Date()) { // Slot is in the past
                timeSlotDiv.classList.add('booked');
                timeSlotDiv.dataset.status = 'past';
                timeSlotDiv.title = 'This slot is in the past.';
            } else {
                hasActuallyAvailableSlots = true;
                timeSlotDiv.addEventListener('click', () => selectTimeSlot(timeSlotDiv));
            }
            timeSlotsContainer.appendChild(timeSlotDiv);
        });

        if (!hasActuallyAvailableSlots) {
            noSlotsMessage.style.display = 'block';
        }
    }

    // Helper to format 24h time from DB to 12h for comparison
    function formatTimeForComparison(time24h) {
        const [hours, minutes] = time24h.split(':');
        const date = new Date(); // Using a dummy date to leverage toLocaleTimeString
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Helper to convert 12-hour time (e.g., "09:00 AM") to 24-hour (e.g., "09:00:00")
    function convertTo24Hour(time12h) {
        const [time, ampm] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (ampm === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
        } else if (ampm === 'AM' && hours === '12') {
            hours = '00';
        }
        return `${hours}:${minutes}:00`;
    }

    // Handle time slot selection
    function selectTimeSlot(slotDiv) {
        const status = slotDiv.dataset.status;
        if (status === 'booked') {
            alert('This slot is already booked. Please choose another time.');
            return;
        } else if (status === 'unavailable') {
            alert(slotDiv.title || 'This technician is not available at this time. Please choose another time.');
            return;
        } else if (status === 'past') {
            alert('This slot is in the past and cannot be booked.');
            return;
        }

        // Clear previous time selection
        const previouslySelectedTime = document.querySelector('.time-slot.selected-slot');
        if (previouslySelectedTime) {
            previouslySelectedTime.classList.remove('selected-slot');
        }

        selectedTime = slotDiv.dataset.time;
        slotDiv.classList.add('selected-slot');

        confirmBookingTime.textContent = selectedTime;
        bookingForm.style.display = 'block'; // Show the booking form
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
        selectedDate = null; // Clear selected date on month change
        selectedDateDisplay.textContent = '';
        timeSlotsContainer.innerHTML = '<p class="no-slots-message" id="noSlotsMessage">Select a date to see available slots.</p>';
        dateMessage.style.display = 'block';
        bookingForm.style.display = 'none';
        bookingMessage.textContent = '';
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
        selectedDate = null; // Clear selected date on month change
        selectedDateDisplay.textContent = '';
        timeSlotsContainer.innerHTML = '<p class="no-slots-message" id="noSlotsMessage">Select a date to see available slots.</p>';
        dateMessage.style.display = 'block';
        bookingForm.style.display = 'none';
        bookingMessage.textContent = '';
    });

    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!technicianId || !selectedDate || !selectedTime || !serviceDescriptionInput.value.trim()) {
            bookingMessage.textContent = 'Please select a date, time, and describe the service.';
            bookingMessage.style.color = 'red';
            return;
        }

        bookingMessage.textContent = 'Booking...';
        bookingMessage.style.color = 'blue';

        const bookingDateDBFormat = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const bookingTimeDBFormat = convertTo24Hour(selectedTime); // HH:MM:SS

        const formData = new FormData();
        formData.append('technician_id', technicianId);
        formData.append('booking_date', bookingDateDBFormat);
        formData.append('booking_time', bookingTimeDBFormat);
        formData.append('service_description', serviceDescriptionInput.value.trim());

        try {
            const response = await fetch('submit_booking.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                bookingMessage.textContent = 'Booking confirmed successfully!';
                bookingMessage.style.color = 'green';
                bookingForm.reset();
                bookingForm.style.display = 'none'; // Hide form after successful booking
                // Re-fetch all calendar data to update state
                await fetchTechnicianCalendarData(technicianId);
                // Reset UI for new selection
                selectedDate = null;
                selectedTime = null;
                renderCalendar(currentMonth, currentYear); // Re-render calendar
                selectedDateDisplay.textContent = ''; // Clear selected date display
                timeSlotsContainer.innerHTML = '<p class="no-slots-message">Select a date to see available slots.</p>';
                dateMessage.style.display = 'block'; // Show initial message again
            } else {
                bookingMessage.textContent = 'Booking failed: ' + result.message;
                bookingMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            bookingMessage.textContent = 'An unexpected error occurred during booking.';
            bookingMessage.style.color = 'red';
        }
        setTimeout(() => bookingMessage.textContent = '', 5000); // Clear message after 5 seconds
    });

    // --- Initial Load ---
    technicianId = getTechnicianIdFromUrl();
    if (technicianId) {
        fetchTechnicianDetails(technicianId);
        fetchTechnicianCalendarData(technicianId); // Fetch and then render calendar/availability
    } else {
        technicianNameDisplay.textContent = 'No Technician Selected';
        alert('No technician ID provided. Please go back and select a technician.');
        // Potentially redirect user back to search page
    }

    renderCalendar(currentMonth, currentYear); // Initial render with current month
});