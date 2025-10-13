<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to submit a review.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$booking_id = $_POST['booking_id'] ?? 0;
$rating = $_POST['rating'] ?? 0;
$comment = $_POST['comment'] ?? '';

if (empty($booking_id) || empty($rating) || $rating < 1 || $rating > 5) {
    $response['message'] = 'Invalid data provided. Please select a rating between 1 and 5.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {
    // Step 1: Verify the user owns the booking and get technician_id
    $stmt = $conn->prepare("SELECT technician_id FROM bookings WHERE booking_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $booking_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('You can only review your own bookings.');
    }
    $booking = $result->fetch_assoc();
    $technician_id = $booking['technician_id'];
    $stmt->close();

    // Step 2: Check if a review already exists for this booking
    $stmt = $conn->prepare("SELECT review_id FROM reviews WHERE booking_id = ?");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        throw new Exception('A review has already been submitted for this booking.');
    }
    $stmt->close();

    // Step 3: Insert the new review
    $stmt = $conn->prepare("INSERT INTO reviews (booking_id, user_id, technician_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisis", $booking_id, $user_id, $technician_id, $rating, $comment);
    $stmt->execute();
    $stmt->close();

    // Step 4: Recalculate and update the technician's average rating
    $stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM reviews WHERE technician_id = ?");
    $stmt->bind_param("s", $technician_id);
    $stmt->execute();
    $avg_result = $stmt->get_result()->fetch_assoc();
    $new_avg_rating = $avg_result['avg_rating'];
    $stmt->close();

    $stmt = $conn->prepare("UPDATE technicians SET rating = ? WHERE id = ?");
    $stmt->bind_param("ds", $new_avg_rating, $technician_id);
    $stmt->execute();
    $stmt->close();
    
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Thank you for your review!';

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'An error occurred: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
