<?php
// File: /Technician/Inventory/get_job_details.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$booking_id = $_GET['booking_id'] ?? 0;

if (empty($booking_id)) {
    $response['message'] = 'Booking ID is required.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "SELECT
                b.booking_id,
                b.work_description,
                u.full_name AS customer_name,
                b.booking_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.booking_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response['success'] = true;
        $response['data'] = $result->fetch_assoc();
    } else {
        $response['message'] = 'Job details not found.';
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>