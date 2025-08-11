<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT b.booking_date, b.booking_time, t.name AS technician_name, t.price , t.services
        FROM bookings b
        JOIN technicians t ON b.technician_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $response['success'] = true;
    $response['data'] = $row;
} else {
    $response['message'] = 'No recent booking found.';
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>