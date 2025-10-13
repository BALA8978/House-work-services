<?php
require '../config/db_connect.php'; 
header('Content-Type: application/json');

$response = [
    'success' => false, 
    'is_available' => false, 
    'booked_slots' => [], 
    'message' => ''
];

$technician_id = $_GET['technician_id'] ?? '';
$date = $_GET['date'] ?? '';

if (empty($technician_id) || empty($date)) {
    $response['message'] = 'Technician ID and date are required.';
    echo json_encode($response);
    exit;
}

try {
    // Check technician's general availability (Day/Night)
    $stmt = $conn->prepare("SELECT availability_type FROM technicians WHERE id = ?");
    $stmt->bind_param("s", $technician_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $technician = $result->fetch_assoc();
        $response['is_available'] = true; 
    } else {
        $response['message'] = 'Technician not found.';
        echo json_encode($response);
        exit;
    }

    // Check for existing bookings on the selected date
    $stmt = $conn->prepare("SELECT booking_time FROM bookings WHERE technician_id = ? AND booking_date = ? AND status != 'Cancelled'");
    $stmt->bind_param("ss", $technician_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $response['booked_slots'][] = $row['booking_time'];
    }

    $response['success'] = true;

} catch (Exception $e) {
    $response['message'] = 'An error occurred while fetching availability: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>