<?php
// get_technician_availability.php
session_start();
require '../config/db_connect.php'; // Use the central database connection file
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = "User not logged in.";
    echo json_encode($response);
    exit();
}

if (!isset($_GET['technician_id']) || empty($_GET['technician_id'])) {
    $response['message'] = "Technician ID is required.";
    echo json_encode($response);
    exit();
}

$technicianId = $conn->real_escape_string($_GET['technician_id']);

// --- 1. Fetch all booked slots for the given technician ---
$sql_booked = "SELECT booking_date, booking_time FROM bookings WHERE technician_id = ?";
$stmt_booked = $conn->prepare($sql_booked);

if ($stmt_booked === false) {
    $response['message'] = "Database prepare failed for booked slots: " . $conn->error;
    echo json_encode($response);
    exit();
}

$stmt_booked->bind_param("s", $technicianId);
$stmt_booked->execute();
$result_booked = $stmt_booked->get_result();

$bookedSlots = [];
if ($result_booked->num_rows > 0) {
    while ($row = $result_booked->fetch_assoc()) {
        $bookedSlots[] = [
            'booking_date' => $row['booking_date'], // YYYY-MM-DD
            'booking_time' => $row['booking_time']  // HH:MM:SS
        ];
    }
}
$stmt_booked->close();

// --- 2. Fetch all declared unavailable periods for the given technician ---
// Fetching periods that are in the future or currently ongoing
$sql_unavailable = "SELECT start_datetime, end_datetime, reason FROM technician_unavailable_periods WHERE technician_id = ? AND end_datetime >= NOW()";
$stmt_unavailable = $conn->prepare($sql_unavailable);

if ($stmt_unavailable === false) {
    $response['message'] = "Database prepare failed for unavailable periods: " . $conn->error;
    echo json_encode($response);
    exit();
}

$stmt_unavailable->bind_param("s", $technicianId);
$stmt_unavailable->execute();
$result_unavailable = $stmt_unavailable->get_result();

$unavailablePeriods = [];
if ($result_unavailable->num_rows > 0) {
    while ($row = $result_unavailable->fetch_assoc()) {
        $unavailablePeriods[] = [
            'start_datetime' => $row['start_datetime'],
            'end_datetime' => $row['end_datetime'],
            'reason' => $row['reason']
        ];
    }
}
$stmt_unavailable->close();


$response['success'] = true;
$response['booked_slots'] = $bookedSlots;
$response['unavailable_periods'] = $unavailablePeriods; // Add unavailable periods to the response

$conn->close();

echo json_encode($response);
?>