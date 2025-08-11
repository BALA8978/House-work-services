<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

if (empty($data['booking_id'])) {
    $response['message'] = 'Booking ID is required.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$booking_id = $data['booking_id'];

// --- Start a database transaction ---
$conn->begin_transaction();

try {
    // Step 1: Update the booking status to 'Cancelled'
    $stmt_booking = $conn->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ? AND user_id = ?");
    $stmt_booking->bind_param("ii", $booking_id, $user_id);
    $stmt_booking->execute();

    // Check if the booking was actually updated (i.e., it exists and belongs to the user)
    if ($stmt_booking->affected_rows > 0) {
        
        // Step 2: Delete the corresponding row from the payments table
        $stmt_payment = $conn->prepare("DELETE FROM payments WHERE booking_id = ?");
        $stmt_payment->bind_param("i", $booking_id);
        $stmt_payment->execute();

        // If both operations were successful, commit the transaction
        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Booking cancelled and payment record removed successfully.';
        
    } else {
        // If the booking wasn't found, no changes are needed, so roll back
        $conn->rollback();
        $response['message'] = 'Booking not found or you do not have permission to cancel it.';
    }
    
    $stmt_booking->close();
    if (isset($stmt_payment)) {
        $stmt_payment->close();
    }

} catch (mysqli_sql_exception $exception) {
    // If any part of the transaction fails, roll back all changes
    $conn->rollback();
    $response['message'] = 'Failed to cancel booking due to a database error.';
    // For debugging, you can log the error:
    // error_log("Cancellation failed: " . $exception->getMessage());
}

$conn->close();
echo json_encode($response);
?>