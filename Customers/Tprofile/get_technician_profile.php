<?php
// Fetches the complete profile for the logged-in technician.
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access denied. Please log in as a technician.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

// SQL to join users table (for name/email) with technician_profiles
$sql = "SELECT u.full_name, u.email, tp.*
        FROM users u
        LEFT JOIN technician_profiles tp ON u.id = tp.user_id
        WHERE u.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response['success'] = true;
    $response['data'] = $result->fetch_assoc();
} else {
    $response['message'] = 'Technician profile not found.';
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>
