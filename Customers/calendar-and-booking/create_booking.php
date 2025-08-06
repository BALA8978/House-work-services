<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to book a service.';
    echo json_encode($response);
    exit;
}

if (empty($data['technician_id']) || empty($data['date']) || empty($data['time'])) {
    $response['message'] = 'All booking details are required.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$technician_id = $data['technician_id'];
$booking_date = $data['date'];
$booking_time = $data['time'];

try {
    $stmt = $conn->prepare("INSERT INTO bookings (user_id, technician_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, 'Confirmed')");
    $stmt->bind_param("isss", $user_id, $technician_id, $booking_date, $booking_time);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Booking created successfully!';
    } else {
        $response['message'] = 'Failed to create booking.';
    }
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() == 1062) { // Duplicate entry
        $response['message'] = 'This time slot is already booked.';
    } else {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>