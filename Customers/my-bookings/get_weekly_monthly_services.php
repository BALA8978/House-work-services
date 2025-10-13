<?php
require '../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'data' => [], 'message' => ''];
try {
    $sql = "SELECT service_id, name, description, frequency, price FROM recurring_services";
    $result = $conn->query($sql);
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>