<?php
// File: /Technician/Tprofile/get_technician_profile.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT 
                u.full_name AS userName, 
                u.email AS userEmail,
                t.isAvailable,
                t.experience,
                t.services,
                tp.gender,
                tp.phone_number,
                tp.area,
                tp.skills,
                tp.status AS profileStatus
            FROM users u
            LEFT JOIN technicians t ON u.id = t.user_id
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

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>