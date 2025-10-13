<?php
// File: /Technician/Inventory/get_available_stock.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

try {
    // This query fetches all distinct items from the inventory.
    // In a real-world scenario with multiple warehouses, you might filter by location.
    $sql = "SELECT item_id, item_name, stock_unit FROM inventory_items ORDER BY item_name ASC";
            
    $result = $conn->query($sql);
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>