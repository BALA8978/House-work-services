<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

$sql = "SELECT claim_id, booking_id, subject, description, status FROM warranty_claims";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
    $response['success'] = true;
} else {
    $response['message'] = 'Could not fetch warranty claims.';
}

echo json_encode($response);
$conn->close();
?>