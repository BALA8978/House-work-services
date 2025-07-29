<?php
// This file is the main booking page. It requires a technician's ID in the URL.
// Example URL: http://localhost/your_folder/booking.php?tech_id=T001

include 'db_connection.php'; // CORRECTED: Changed from db_connect.php to db_connection.php

$technician_id = isset($_GET['tech_id']) ? $_GET['tech_id'] : '';
$technician_name = 'Unknown';
$error_message = '';

if (empty($technician_id)) {
    $error_message = 'No technician was selected. Please go back and choose a technician.';
} else {
    // Fetch the technician's details from the database.
    $sql = "SELECT name, isAvailable FROM technicians_details WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $technician_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($tech = $result->fetch_assoc()) {
        // Check if the technician is available for a new booking.
        if ($tech['isAvailable'] == 0) {
             $error_message = 'Sorry, ' . htmlspecialchars($tech['name']) . ' has already been booked and is no longer available.';
        } else {
            $technician_name = $tech['name'];
        }
    } else {
        $error_message = 'The selected technician could not be found.';
    }
    $stmt->close();
}
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Appointment with <?php echo htmlspecialchars($technician_name); ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">

        <?php if (!empty($error_message)): ?>
            <div class="error-box">
                <h2>Error</h2>
                <p><?php echo $error_message; ?></p>
            </div>
        <?php else: ?>
            <h1>Book an Appointment</h1>
            <h2>with <strong><?php echo htmlspecialchars($technician_name); ?></strong></h2>
            
            <div id="booking-section" data-tech-id="<?php echo htmlspecialchars($technician_id); ?>">
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button id="prev-month-btn">&lt;</button>
                        <h3 id="month-year"></h3>
                        <button id="next-month-btn">&gt;</button>
                    </div>
                    <div class="calendar-grid" id="calendar"></div>
                </div>
                <div id="slots-container" class="hidden">
                    <h3>Select an available time for <span id="selected-date-span"></span></h3>
                    <div id="slot-list"></div>
                </div>
                <button id="book-now-btn" disabled>Confirm Booking</button>
            </div>
        <?php endif; ?>

    </div>
    <!-- Only load the script if there is no error -->
    <?php if (empty($error_message)): ?>
        <script src="script.js"></script>
    <?php endif; ?>
</body>
</html>
