<?php
require '../../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'data' => []];

$sql = "SELECT full_name, email, registration_date FROM users WHERE role = 'admin' ORDER BY registration_date DESC";
$result = $conn->query($sql);
if ($result) {
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $response['success'] = true;
}
echo json_encode($response);
$conn->close();
?>