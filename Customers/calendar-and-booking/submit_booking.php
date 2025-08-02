<?php
// submit_booking.php
session_start();
require '../config/db_connect.php'; // Use the central database connection file
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Invalid request method. Only POST requests are accepted.";
    echo json_encode($response);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'customer') {
    $response['message'] = "Access denied. Please log in as a customer to book services.";
    echo json_encode($response);
    exit();
}

$userId = $_SESSION['user_id'];

// Get data from POST request
$technicianId = $_POST['technician_id'] ?? '';
$bookingDate = $_POST['booking_date'] ?? ''; // YYYY-MM-DD
$bookingTime = $_POST['booking_time'] ?? ''; // HH:MM:SS
$serviceDescription = $_POST['service_description'] ?? '';

// Basic server-side validation
if (empty($technicianId) || empty($bookingDate) || empty($bookingTime) || empty($serviceDescription)) {
    $response['message'] = "All booking fields are required.";
    echo json_encode($response);
    exit();
}

// Validate date and time format (simple regex, more robust validation might be needed)
if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $bookingDate)) {
    $response['message'] = "Invalid date format. Expected YYYY-MM-DD.";
    echo json_encode($response);
    exit();
}
if (!preg_match("/^\d{2}:\d{2}:\d{2}$/", $bookingTime)) {
    $response['message'] = "Invalid time format. Expected HH:MM:SS.";
    echo json_encode($response);
    exit();
}

// Check if the slot is already booked for this technician
$stmt_check = $conn->prepare("SELECT booking_id FROM bookings WHERE technician_id = ? AND booking_date = ? AND booking_time = ?");
if ($stmt_check === false) {
    $response['message'] = "Prepare statement failed for slot check: " . $conn->error;
    echo json_encode($response);
    exit();
}
$stmt_check->bind_param("sss", $technicianId, $bookingDate, $bookingTime);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    $response['message'] = "This slot is already booked. Please choose another time.";
    echo json_encode($response);
    $stmt_check->close();
    $conn->close();
    exit();
}
$stmt_check->close();

// Insert the new booking
$sql_insert = "INSERT INTO bookings (user_id, technician_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?)";
$stmt_insert = $conn->prepare($sql_insert);

if ($stmt_insert === false) {
    $response['message'] = "Prepare statement failed for insert: " . $conn->error;
    echo json_encode($response);
    exit();
}

$status = 'Confirmed'; // Default status for new bookings

// Assuming user_id is an integer, others are strings
$stmt_insert->bind_param("issss", $userId, $technicianId, $bookingDate, $bookingTime, $status);

if ($stmt_insert->execute()) {
    $response['success'] = true;
    $response['message'] = "Booking successfully confirmed!";
} else {
    $response['message'] = "Error confirming booking: " . $stmt_insert->error;
}

$stmt_insert->close();
$conn->close();

echo json_encode($response);
?>