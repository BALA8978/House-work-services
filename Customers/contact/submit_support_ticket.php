<?php
// File: /Customers/contact/submit_support_ticket.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to submit a support ticket.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$subject = trim($_POST['subject'] ?? '');
$description = trim($_POST['message'] ?? ''); // From your form's textarea name
$booking_id = !empty($_POST['booking_id']) ? (int)$_POST['booking_id'] : null;

if (empty($subject) || empty($description)) {
    $response['message'] = 'Subject and message are required fields.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "INSERT INTO support_tickets (user_id, booking_id, subject, description, status) VALUES (?, ?, ?, ?, 'Open')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iis_s", $user_id, $booking_id, $subject, $description);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Your support ticket has been submitted! Our team will get back to you shortly.';
    } else {
        throw new Exception('Failed to create support ticket in the database.');
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>