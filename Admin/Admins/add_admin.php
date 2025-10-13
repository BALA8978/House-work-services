<?php
require '../../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$fullName = $data['full_name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($fullName) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
    $response['message'] = 'Invalid data provided. Please check all fields.';
    echo json_encode($response);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$role = 'admin';

try {
    $sql = "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $fullName, $email, $hashedPassword, $role);
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'New admin has been added successfully!';
    } else {
        throw new Exception('Email may already be in use.');
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>