<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$sql = "SELECT id, name, description, frequency, price FROM recurring_services ORDER BY frequency, name";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
    $response['success'] = true;
} else {
    $response['message'] = 'Could not fetch services from the database.';
}

echo json_encode($response);

$conn->close();
?>