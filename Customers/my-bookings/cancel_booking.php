<?php
require '../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to cancel a booking.';
    echo json_encode($response);
    exit;
}
$booking_id = $data['booking_id'] ?? 0;
$reason = $data['reason'] ?? '';
if (empty($booking_id) || empty($reason)) {
    $response['message'] = 'Booking ID and reason for cancellation are required.';
    echo json_encode($response);
    exit;
}
$conn->begin_transaction();
try {
    $stmt = $conn->prepare("UPDATE bookings SET status = 'Cancelled', cancellation_reason = ? WHERE booking_id = ? AND user_id = ?");
    $stmt->bind_param("sii", $reason, $booking_id, $_SESSION['user_id']);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        $payment_stmt = $conn->prepare("UPDATE payments SET status = 'Refunding' WHERE booking_id = ? AND status = 'Paid'");
        $payment_stmt->bind_param("i", $booking_id);
        $payment_stmt->execute();
        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Booking successfully cancelled. If you have already paid, a refund has been initiated.';
    } else {
        throw new Exception('Could not find the booking or you do not have permission to cancel it.');
    }
} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>