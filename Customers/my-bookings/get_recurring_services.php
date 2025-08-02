<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

if (!isset($_SESSION['user_id'])) {
    echo json_encode($response);
    exit;
}

// Placeholder for fetching recurring services.
// You would have a table for recurring bookings and logic to get the next service date.
$response['data'][] = [
    'service_description' => 'Weekly Lawn Mowing',
    'frequency' => 'Weekly',
    'next_service_date' => '2025-08-08'
];

$response['data'][] = [
    'service_description' => 'Monthly Pool Maintenance',
    'frequency' => 'Monthly',
    'next_service_date' => '2025-08-25'
];


$response['success'] = true;
echo json_encode($response);

$conn->close();
?>