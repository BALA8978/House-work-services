<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$sql = "SELECT 
            ii.item_name, 
            ii.item_description, 
            ii.stock_unit,
            SUM(ist.quantity) as total_quantity
        FROM inventory_items ii
        LEFT JOIN inventory_stock ist ON ii.item_id = ist.item_id
        GROUP BY ii.item_id
        ORDER BY ii.item_name";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
    $response['success'] = true;
} else {
    $response['message'] = 'Could not fetch stock levels.';
}

echo json_encode($response);
$conn->close();
?>