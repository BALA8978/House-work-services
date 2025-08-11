<?php
// get_technician_profile.php

// --- Improved Error Handling ---
error_reporting(0);
ini_set('display_errors', 0);

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

header('Content-Type: application/json');
$response = ['success' => false, 'message' => 'An unknown error occurred.'];

try {
    // --- Database Connection ---
    $db_connect_path = __DIR__ . '/../config/db_connect.php';

    if (!file_exists($db_connect_path)) {
        throw new Exception("Database connection file not found at: " . $db_connect_path);
    }
    include $db_connect_path;

    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User not logged in.");
    }

    $userId = $_SESSION['user_id'];

    // --- Database Query ---
    // CORRECTED: The query now only selects columns that exist in your older database schema.
    $stmt = $conn->prepare("
        SELECT
            u.full_name,
            u.email,
            u.role,
            tp.gender,
            tp.skills,
            tp.phone_number
        FROM
            users u
        LEFT JOIN
            technician_profiles tp ON u.id = tp.user_id
        WHERE
            u.id = ?
    ");

    if ($stmt === false) {
        throw new Exception("Database statement preparation failed: " . $conn->error);
    }

    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['message'] = 'Profile loaded successfully.';
        $response['data'] = [
            'userName' => $row['full_name'],
            'userEmail' => $row['email'],
            'role' => $row['role'],
            'gender' => $row['gender'],
            'skills' => $row['skills'],
            'phone' => $row['phone_number'] // Mapped for JS
        ];
    } else {
        $response['message'] = "Technician profile data not found for user ID: " . $userId;
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    $response['message'] = "Server Error: " . $e->getMessage();
}

echo json_encode($response);
?>
