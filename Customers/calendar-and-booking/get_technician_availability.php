<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'is_available' => false, 'booked_slots' => []];

if (!isset($_GET['technician_id']) || !isset($_GET['date'])) {
    $response['message'] = 'Technician ID and date are required.';
    echo json_encode($response);
    exit;
}

$technician_id = $_GET['technician_id'];
$date = $_GET['date'];

// Get technician's general availability
$stmt = $conn->prepare("SELECT isAvailable FROM technicians WHERE id = ?");
$stmt->bind_param("s", $technician_id);
$stmt->execute();
$result = $stmt->get_result();
$technician = $result->fetch_assoc();

if ($technician) {
    $response['is_available'] = (bool)$technician['isAvailable'];
}
$stmt->close();

// Get booked slots for the selected date
$stmt = $conn->prepare("SELECT booking_time FROM bookings WHERE technician_id = ? AND booking_date = ?");
$stmt->bind_param("ss", $technician_id, $date);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['booked_slots'][] = $row['booking_time'];
}
$stmt->close();

$response['success'] = true;
echo json_encode($response);

$conn->close();
?>