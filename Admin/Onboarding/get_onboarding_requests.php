<?php
require '../../Customers/config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

$sql = "SELECT p.user_id, p.full_name, p.skills, u.email FROM pending_technicians p JOIN users u ON p.user_id = u.id WHERE p.status = 'pending'";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
    $response['success'] = true;
} else {
    $response['message'] = 'Could not fetch onboarding requests.';
}

echo json_encode($response);
$conn->close();
?>