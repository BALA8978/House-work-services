<?php
require '..//config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['request_id']) || empty($data['status'])) {
    $response['message'] = 'Request ID and status are required.';
    echo json_encode($response);
    exit;
}

$request_id = $data['request_id'];
$status = $data['status']; // 'Approved' or 'Rejected'

$stmt = $conn->prepare("UPDATE item_requests SET status = ? WHERE request_id = ?");
$stmt->bind_param("si", $status, $request_id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = 'Request status updated successfully!';
} else {
    $response['message'] = 'Failed to update request status.';
}

echo json_encode($response);
$stmt->close();
$conn->close();
?>