<?php
header('Content-Type: application/json');
include 'db_connect.php';

$technician_id = isset($_GET['technician_id']) ? $_GET['technician_id'] : '';
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
$month = isset($_GET['month']) ? intval($_GET['month']) : date('m');

if (empty($technician_id)) {
    echo json_encode([]);
    exit;
}

// This script fetches existing bookings for a specific technician to show on the calendar.
$sql = "SELECT booking_date, booking_time FROM bookings WHERE technician_id = ? AND YEAR(booking_date) = ? AND MONTH(booking_date) = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sii", $technician_id, $year, $month);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($bookings);
?>
