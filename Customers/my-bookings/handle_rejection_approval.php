<?php
require '../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'Access Denied. Please log in.';
    echo json_encode($response);
    exit;
}
$booking_id = $data['booking_id'] ?? 0;
$is_approved = $data['approved'] ?? false;
$user_id = $_SESSION['user_id'];
if (empty($booking_id) || !$is_approved) {
    $response['message'] = 'Invalid request.';
    echo json_encode($response);
    exit;
}
$conn->begin_transaction();
try {
    $verify_stmt = $conn->prepare("SELECT booking_id FROM bookings WHERE booking_id = ? AND user_id = ?");
    $verify_stmt->bind_param("ii", $booking_id, $user_id);
    $verify_stmt->execute();
    if ($verify_stmt->get_result()->num_rows === 0) {
        throw new Exception('You do not have permission to modify this booking.');
    }
    $verify_stmt->close();
    $update_stmt = $conn->prepare("UPDATE open_jobs SET is_customer_approved = 1 WHERE booking_id = ?");
    $update_stmt->bind_param("i", $booking_id);
    $update_stmt->execute();
    if ($update_stmt->affected_rows > 0) {
        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Approval successful! We are now searching for a new technician for your job.';
    } else {
        throw new Exception('Could not process the approval.');
    }
    $update_stmt->close();
} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>