document.addEventListener('DOMContentLoaded', () => {
    const bookingSection = document.getElementById('booking-section');
    if (!bookingSection) return; // Stop if there's an error on the page

    // Page Elements
    const calendarEl = document.getElementById('calendar');
    const monthYearEl = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const slotsContainer = document.getElementById('slots-container');
    const selectedDateSpan = document.getElementById('selected-date-span');
    const slotList = document.getElementById('slot-list');
    const bookNowBtn = document.getElementById('book-now-btn');

    // State from HTML
    const technicianId = bookingSection.dataset.techId;
    let currentDate = new Date();
    let bookings = [];
    let selectedDayElement = null;

    async function generateCalendar(year, month) {
        const response = await fetch(`get_bookings.php?technician_id=${technicianId}&year=${year}&month=${month + 1}`);
        bookings = await response.json();
        
        calendarEl.innerHTML = '';
        slotsContainer.classList.add('hidden');
        bookNowBtn.disabled = true;

        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = firstDay.getDay();
        monthYearEl.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const weekdayEl = document.createElement('div');
            weekdayEl.className = 'weekday';
            weekdayEl.textContent = day;
            calendarEl.appendChild(weekdayEl);
        });

        for (let i = 0; i < startDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day');
            calendarEl.appendChild(emptyDay);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day', 'current-month');
            dayEl.textContent = day;
            const date = new Date(year, month, day);

            if (date < today) {
                dayEl.classList.add('past-day');
            } else {
                dayEl.classList.add('clickable');
                dayEl.addEventListener('click', () => handleDayClick(dayEl, date));
            }
            calendarEl.appendChild(dayEl);
        }
    }

    function handleDayClick(dayEl, date) {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        dayEl.classList.add('selected');
        selectedDayElement = dayEl;

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        selectedDateSpan.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        const dayBookings = bookings.filter(b => b.booking_date === dateStr).map(b => b.booking_time);
        
        const availableSlots = ['09:00:00', '10:00:00', '11:00:00', '12:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00'];
        slotList.innerHTML = '';

        availableSlots.forEach(time => {
            const isBooked = dayBookings.includes(time);
            const slotEl = document.createElement('div');
            slotEl.className = 'slot';
            const timeFormatted = time.substring(0, 5);
            const radioId = `slot-${time.replace(/:/g, '')}`;

            slotEl.innerHTML = `
                <input type="radio" id="${radioId}" name="time-slot" value="${time}" ${isBooked ? 'disabled' : ''}>
                <label for="${radioId}">${timeFormatted}</label>
            `;
            slotList.appendChild(slotEl);
        });
        
        slotsContainer.classList.remove('hidden');
        bookNowBtn.disabled = true;

        slotList.addEventListener('change', (event) => {
            if (event.target.name === 'time-slot' && !event.target.disabled) {
                bookNowBtn.disabled = false;
            }
        });
    }

    bookNowBtn.addEventListener('click', async () => {
        const selectedTimeRadio = document.querySelector('input[name="time-slot"]:checked');
        if (!selectedDayElement || !selectedTimeRadio) {
            alert('Please select a valid time slot.');
            return;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = selectedDayElement.textContent;
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const time = selectedTimeRadio.value;

        const formData = new FormData();
        formData.append('technician_id', technicianId);
        formData.append('date', date);
        formData.append('time', time);

        const response = await fetch('book_slot.php', { method: 'POST', body: formData });
        const result = await response.json();

        alert(result.message);

        if (result.success) {
            // After successful booking, redirect or disable the page
            // to prevent another booking for the same technician.
            bookingSection.innerHTML = `<h2>Thank you! Your appointment is confirmed.</h2>`;
        } else {
            // If booking failed (e.g., slot taken), refresh calendar to show the latest data.
            await generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Initial Load
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});
