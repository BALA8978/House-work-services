<?php
// File: /Technician/Inventory/request_item.php (Corrected)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$itemName = trim($_POST['item-name'] ?? ''); // This should match the form's input name
$reason = trim($_POST['reason'] ?? '');     // This should match the form's input name

if (empty($itemName) || empty($reason)) {
    $response['message'] = 'Item name and reason for request are required.';
    echo json_encode($response);
    exit;
}

try {
    // --- THIS IS THE CORRECTED SQL QUERY ---
    // The 'item_description' column has been removed to match your table structure.
    $sql = "INSERT INTO item_requests (technician_user_id, item_name, reason, status) VALUES (?, ?, ?, 'Pending')";
    $stmt = $conn->prepare($sql);
    
    // The bind_param now only has three 's' types for the three string variables.
    $stmt->bind_param("iss", $user_id, $itemName, $reason);

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