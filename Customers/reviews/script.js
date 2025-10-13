document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.rating-stars .fa-star');
    const ratingValue = document.getElementById('rating-value');
    const bookingIdInput = document.getElementById('booking_id');
    const reviewForm = document.getElementById('review-form');

    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    if (bookingId) {
        bookingIdInput.value = bookingId;
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            resetStars();
            const rating = this.dataset.value;
            for (let i = 0; i < rating; i++) {
                stars[i].classList.replace('far', 'fas');
            }
        });

        star.addEventListener('click', function() {
            ratingValue.value = this.dataset.value;
        });

        star.addEventListener('mouseout', () => {
            resetStars();
            const currentRating = ratingValue.value;
            for (let i = 0; i < currentRating; i++) {
                stars[i].classList.replace('far', 'fas');
            }
        });
    });

    function resetStars() {
        stars.forEach(star => {
            star.classList.replace('fas', 'far');
        });
    }

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(reviewForm);

        try {
            const response = await fetch('submit_review.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                window.location.href = '../my-bookings/index.html';
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('An error occurred. Please try again.');
        }
    });
});