<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$sql = "SELECT 
            ir.request_id, 
            ir.item_name, 
            ir.reason, 
            u.full_name AS technician_name
        FROM item_requests ir
        JOIN users u ON ir.technician_user_id = u.id
        WHERE ir.status = 'Pending'
        ORDER BY ir.requested_at DESC";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
    $response['success'] = true;
} else {
    $response['message'] = 'Could not fetch item requests.';
}

echo json_encode($response);
$conn->close();
?>