<?php
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => 'An unknown error occurred.'];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Authentication required. Please log in.');
    }
    if (!isset($_GET['payment_id'])) {
        throw new Exception('Payment ID is required.');
    }

    $payment_id = $_GET['payment_id'];
    $user_id = $_SESSION['user_id'];

    // The SQL query is corrected to use `p.status` instead of `p.payment_status`
    $sql = "SELECT p.amount, p.status
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            WHERE p.payment_id = ? AND b.user_id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database prepare statement failed: " . $conn->error);
    }
    
    $stmt->bind_param("ii", $payment_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $response['success'] = true;
        // Map the DB column 'status' to 'payment_status' for the frontend JS
        $response['data'] = [
            'amount' => $row['amount'],
            'payment_status' => $row['status'] 
        ];
        $response['message'] = 'Details fetched successfully.';
    } else {
        $response['message'] = 'Payment record not found or access denied.';
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>