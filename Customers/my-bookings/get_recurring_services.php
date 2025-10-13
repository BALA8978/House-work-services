<?php
// File: /Customers/my-bookings/get_recurring_services.php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}
$user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT 
                rb.recurring_booking_id,
                rs.name AS service_description,
                rs.frequency,
                rb.next_service_date,
                rb.status
            FROM recurring_bookings rb
            JOIN recurring_services rs ON rb.service_id = rs.service_id
            WHERE rb.user_id = ?
            ORDER BY rb.next_service_date ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>