<?php
// File: /Customers/my-bookings/manage_recurring_booking.php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to manage services.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$booking_id = $data['recurring_booking_id'] ?? 0;
$action = $data['action'] ?? ''; // 'pause', 'resume', or 'cancel'

$allowed_actions = ['pause' => 'Paused', 'resume' => 'Active', 'cancel' => 'Cancelled'];

if (empty($booking_id) || !array_key_exists($action, $allowed_actions)) {
    $response['message'] = 'Invalid action or booking ID provided.';
    echo json_encode($response);
    exit;
}

$new_status = $allowed_actions[$action];

try {
    // Security check: ensure the booking belongs to the logged-in user before updating
    $stmt = $conn->prepare("UPDATE recurring_bookings SET status = ? WHERE recurring_booking_id = ? AND user_id = ?");
    $stmt->bind_param("sii", $new_status, $booking_id, $user_id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = "Service successfully {$new_status}.";
        } else {
            throw new Exception("Could not update service. It might not belong to you or the status is already set.");
        }
    } else {
        throw new Exception("Database update failed.");
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>