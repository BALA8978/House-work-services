<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User is not logged in.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT 
                p.payment_id,
                p.amount,
                p.status AS payment_status,
                b.booking_date,
                b.work_status,
                t.name AS technician_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN technicians t ON p.technician_id = t.id
            WHERE p.customer_id = ?
            ORDER BY b.booking_date DESC, p.payment_id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred while fetching payments: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
