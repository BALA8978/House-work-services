<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['claim_id']) || empty($data['status'])) {
    $response['message'] = 'Claim ID and status are required.';
    echo json_encode($response);
    exit;
}

$claim_id = $data['claim_id'];
$status = $data['status'];

$stmt = $conn->prepare("UPDATE warranty_claims SET status = ? WHERE claim_id = ?");
$stmt->bind_param("si", $status, $claim_id);

if ($stmt->execute()) {
    $response['success'] = true;
    $response['message'] = 'Warranty claim status updated successfully.';
} else {
    $response['message'] = 'Failed to update warranty claim status.';
}

$stmt->close();
$conn->close();
echo json_encode($response);
?>