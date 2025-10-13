<?php
// File: /Technician/Inventory/get_job_materials.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$booking_id = $_GET['booking_id'] ?? 0;

if (empty($booking_id)) {
    $response['message'] = 'Booking ID is required to fetch materials.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "SELECT 
                ii.item_name,
                jm.quantity_used,
                jm.status
            FROM job_materials jm
            JOIN inventory_items ii ON jm.item_id = ii.item_id
            WHERE jm.booking_id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>