<?php
// File: /Technician/jobs/get_open_jobs.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "SELECT
                b.booking_id,
                u.full_name AS customer_name,
                cp.address,
                cp.city,
                cp.pincode,
                b.booking_date,
                b.booking_time,
                b.work_description
            FROM open_jobs oj
            JOIN bookings b ON oj.booking_id = b.booking_id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN customer_profiles cp ON u.id = cp.user_id
            WHERE oj.is_customer_approved = 1 AND b.technician_id IS NULL
            ORDER BY b.booking_date, b.booking_time";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>