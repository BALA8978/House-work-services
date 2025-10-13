<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

$technician_id = $_GET['technician_id'] ?? '';

if (empty($technician_id)) {
    $response['message'] = 'Technician ID is required.';
    echo json_encode($response);
    exit;
}

try {
    // Fetch technician details for the confirmation page
    $stmt = $conn->prepare("SELECT name, services, price FROM technicians WHERE id = ?");
    $stmt->bind_param("s", $technician_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response['success'] = true;
        $response['data'] = $result->fetch_assoc();
    } else {
        $response['message'] = 'Technician details not found.';
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'An error occurred while fetching booking details: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>