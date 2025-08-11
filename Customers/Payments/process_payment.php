<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'Authentication required.';
    echo json_encode($response);
    exit;
}
if (empty($data['payment_id'])) {
    $response['message'] = 'Invalid payment data.';
    echo json_encode($response);
    exit;
}

$payment_id = $data['payment_id'];
$user_id = $_SESSION['user_id'];
$conn->begin_transaction();

try {
    // Corrected the column name in the WHERE clause to `p.status`
    $check_sql = "SELECT p.payment_id FROM payments p
                  JOIN bookings b ON p.booking_id = b.booking_id
                  WHERE p.payment_id = ? AND b.user_id = ? AND p.status = 'Pending'";
    
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ii", $payment_id, $user_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 1) {
        // Corrected the column name in the UPDATE statement to `status`
        $update_sql = "UPDATE payments SET status = 'Paid', payment_date = NOW() WHERE payment_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $payment_id);

        if ($update_stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Payment completed successfully!';
            $conn->commit();
        } else {
            throw new Exception('Failed to update payment status.');
        }
        $update_stmt->close();
    } else {
        $response['message'] = 'This payment cannot be processed. It might already be paid or invalid.';
        $conn->rollback();
    }
    $check_stmt->close();

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'A database error occurred: ' . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>