<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$sql = "SELECT service_id, service_name, base_price FROM services ORDER BY service_name";
$result = $conn->query($sql);

if ($result) {
    $response['data'] = $result->fetch_all (MYSQLI_ASSOC);
    $response['success'] = true;
}

echo json_encode($response);
$conn->close();
?>