<?php
require '../../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$service_id = $data['service_id'] ?? 0;
$new_price = $data['new_price'] ?? 0;

if (empty($service_id) || !is_numeric($new_price) || $new_price < 0) {
    $response['message'] = 'Invalid data provided.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "UPDATE services SET base_price = ? WHERE service_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("di", $new_price, $service_id);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Price updated successfully!';
    } else {
        throw new Exception("Database update failed.");
    }
} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>