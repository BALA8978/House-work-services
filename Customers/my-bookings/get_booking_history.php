<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

if (!isset($_SESSION['user_id'])) {
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

// Added b.booking_id to the SELECT statement
$sql = "SELECT b.booking_id, b.booking_date, b.booking_time, b.status, t.name AS technician_name
        FROM bookings b
        JOIN technicians t ON b.technician_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $response['data'][] = $row;
}

$response['success'] = true;
echo json_encode($response);

$stmt->close();
$conn->close();
?>