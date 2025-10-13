<?php
// File: /Technician/Inventory/add_material_to_job.php (Corrected)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

// --- THIS IS THE CORRECTED LOGIC ---
// Read the raw JSON payload from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Get variables from the decoded JSON data
$booking_id = $data['booking_id'] ?? 0;
$item_id = $data['item_id'] ?? 0;
$quantity = $data['quantity'] ?? 0;
// --- END OF CORRECTION ---


if (empty($booking_id) || empty($item_id) || !is_numeric($quantity) || $quantity <= 0) {
    $response['message'] = 'Invalid data provided. Please select an item and enter a valid quantity.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "INSERT INTO job_materials (booking_id, item_id, quantity_used, status)
            VALUES (?, ?, ?, 'Used')
            ON DUPLICATE KEY UPDATE quantity_used = quantity_used + VALUES(quantity_used)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $booking_id, $item_id, $quantity);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Material added to job successfully!';
    } else {
        throw new Exception("Database error: Could not add material.");
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>