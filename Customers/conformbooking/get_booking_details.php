<?php
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

if (!isset($_GET['technician_id'])) {
    $response['message'] = 'Technician ID is required.';
    echo json_encode($response);
    exit;
}

$technician_id = $_GET['technician_id'];

$sql = "SELECT name, services, price FROM technicians WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $technician_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $response['success'] = true;
    $response['data'] = $row;
} else {
    $response['message'] = 'Technician not found.';
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>