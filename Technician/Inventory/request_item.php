<?php
// File: /Technician/Inventory/request_item.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$itemName = trim($_POST['item_name'] ?? '');
$description = trim($_POST['item_description'] ?? '');
$reason = trim($_POST['reason'] ?? '');

if (empty($itemName) || empty($reason)) {
    $response['message'] = 'Item name and reason for request are required.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "INSERT INTO item_requests (technician_user_id, item_name, item_description, reason, status) VALUES (?, ?, ?, ?, 'Pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $user_id, $itemName, $description, $reason);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Your item request has been submitted for admin approval!';
    } else {
        throw new Exception('Failed to submit item request.');
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>