<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$tech_sql = "SELECT id, name FROM technicians WHERE isAvailable = 1 ORDER BY name";
$tech_result = $conn->query($tech_sql);

$cust_sql = "SELECT id, full_name FROM users WHERE role = 'customer' ORDER BY full_name";
$cust_result = $conn->query($cust_sql);

if ($tech_result && $cust_result) {
    $response['data']['technicians'] = $tech_result->fetch_all(MYSQLI_ASSOC);
    $response['data']['customers'] = $cust_result->fetch_all(MYSQLI_ASSOC);
    $response['success'] = true;
}

echo json_encode($response);
$conn->close();
?>