<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to submit a warranty claim.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$booking_id = $_POST['booking_id'] ?? 0;
$subject = trim($_POST['subject'] ?? '');
$description = trim($_POST['description'] ?? '');

if (empty($booking_id) || empty($subject) || empty($description)) {
    $response['message'] = 'All fields are required to submit a claim.';
    echo json_encode($response);
    exit;
}

try {
    // Step 1: Verify the user owns the booking and that the work was completed
    $stmt = $conn->prepare("SELECT booking_id FROM bookings WHERE booking_id = ? AND user_id = ? AND work_status = 'Completed'");
    $stmt->bind_param("ii", $booking_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Warranty claims can only be filed for your own successfully completed bookings.');
    }
    $stmt->close();

    // Step 2: Check if a claim already exists for this booking
    $stmt = $conn->prepare("SELECT claim_id FROM warranty_claims WHERE booking_id = ?");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        throw new Exception('A warranty claim has already been submitted for this booking.');
    }
    $stmt->close();

    // Step 3: Insert the new warranty claim
    $stmt = $conn->prepare("INSERT INTO warranty_claims (booking_id, user_id, subject, description, status) VALUES (?, ?, ?, ?, 'Pending')");
    $stmt->bind_param("iiss", $booking_id, $user_id, $subject, $description);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Warranty claim submitted successfully. We will review it and get back to you shortly.';
    } else {
        throw new Exception('Failed to submit your claim. Please try again later.');
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'An error occurred: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
