<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (empty($_POST['item_name']) || empty($_POST['item_type']) || empty($_POST['stock_unit'])) {
    $response['message'] = 'Item name, type, and stock unit are required.';
    echo json_encode($response);
    exit;
}

$item_name = $_POST['item_name'];
$item_type = $_POST['item_type'];
$stock_unit = $_POST['stock_unit'];
$item_description = $_POST['item_description'] ?? '';

$stmt = $conn->prepare("INSERT INTO inventory_items (item_name, item_type, stock_unit, item_description) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $item_name, $item_type, $stock_unit, $item_description);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = 'New item added successfully!';
} else {
    if ($conn->errno == 1062) { // Duplicate entry
        $response['message'] = 'An item with this name already exists.';
    } else {
        $response['message'] = 'Failed to add new item: ' . $stmt->error;
    }
}

echo json_encode($response);
$stmt->close();
$conn->close();
?>