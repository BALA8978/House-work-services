document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const technicianId = urlParams.get('technician_id');

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTimeSlot = null;

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'weekday-name');
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });

        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'disabled');
            calendarGrid.appendChild(emptyDay);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight for accurate date comparison

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;
            const date = new Date(year, month, i);

            if (date < today) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
                    dayElement.classList.add('selected');
                    selectedDate = date;
                    selectedTimeSlot = null;
                    confirmBookingBtn.disabled = true;
                    selectedDateDisplay.textContent = `Selected Date: ${selectedDate.toDateString()}`;
                    fetchAvailability();
                });
            }
            calendarGrid.appendChild(dayElement);
        }
    }

    async function fetchAvailability() {
        if (!selectedDate) return;

        timeSlotsGrid.innerHTML = '<p>Loading time slots...</p>';
        const dateString = selectedDate.toISOString().split('T')[0];
        try {
            const response = await fetch(`get_technician_availability.php?technician_id=${technicianId}&date=${dateString}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            renderTimeSlots(data);
        } catch (error) {
            console.error("Fetch error:", error);
            timeSlotsGrid.innerHTML = '<p>Could not load time slots.</p>';
        }
    }

    function renderTimeSlots(availability) {
        timeSlotsGrid.innerHTML = '';
        if (!availability || !availability.success) {
            timeSlotsGrid.innerHTML = '<p>Availability for this day could not be determined.</p>';
            return;
        }

        // Define the list of possible slots based on backend data
        const slots = availability.is_available ?
            ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00'] :
            ['19:00-21:00'];
        
        // --- NEW LOGIC: Get current time details for comparison ---
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();

        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('time-slot');
            slotElement.textContent = slot;

            // --- NEW LOGIC: Determine if the slot is unavailable for any reason ---
            const isBooked = availability.booked_slots && availability.booked_slots.includes(slot);
            let isPast = false;

            // Check if the time has passed, but ONLY if the selected date is today
            if (isToday) {
                const slotEndHour = parseInt(slot.split('-')[1].split(':')[0]); // e.g., gets 11 from "09:00-11:00"
                if (now.getHours() >= slotEndHour) {
                    isPast = true;
                }
            }

            // If the slot is either booked OR its time has passed for today, make it red and disabled
            if (isBooked || isPast) {
                slotElement.classList.add('unavailable', 'disabled');
            } else {
                // Otherwise, it's available and clickable
                slotElement.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                    slotElement.classList.add('selected');
                    selectedTimeSlot = slot;
                    confirmBookingBtn.disabled = false;
                });
            }
            timeSlotsGrid.appendChild(slotElement);
        });
    }

    async function confirmBooking() {
        if (!selectedDate || !selectedTimeSlot) {
            alert('Please select a date and time slot.');
            return;
        }

        const dateString = selectedDate.toISOString().split('T')[0];
        try {
            const response = await fetch('create_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    technician_id: technicianId,
                    date: dateString,
                    time: selectedTimeSlot
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Booking confirmed!');
                window.location.href = '../my-bookings/index.html';
            } else {
                alert(`Booking failed: ${result.message}`);
                fetchAvailability(); // Refresh slots in case someone else just booked it
            }
        } catch (error) {
            alert('Booking failed due to a network error.');
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    confirmBookingBtn.addEventListener('click', confirmBooking);

    renderCalendar();
});