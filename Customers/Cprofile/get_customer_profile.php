<?php
// get_customer_profile.php

include 'db_setup.php'; // Include your database connection file

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

// Check if user is logged in via session (assuming 'user_id' is set during login)
if (!isset($_SESSION['user_id'])) {
    $response['message'] = "User not logged in. Session user_id not set.";
    echo json_encode($response);
    exit();
}

$userId = $_SESSION['user_id'];

// Prepare and execute a JOIN query to get user details and their profile
// IMPORTANT: Changed 'login l' to 'users l'
$stmt = $conn->prepare("
    SELECT
        l.full_name,
        l.email,
        cp.gender,
        cp.phone,
        cp.address,
        cp.city,
        cp.state,
        cp.pincode
    FROM
        users l  -- Changed from 'login l' to 'users l'
    LEFT JOIN
        customer_profiles cp ON l.id = cp.user_id
    WHERE
        l.id = ?
");
$stmt->bind_param("i", $userId); // 'i' for integer (user_id)

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $response['success'] = true;
    $response['data'] = [
        'userName' => $row['full_name'],
        'userEmail' => $row['email'],
        'gender' => $row['gender'],
        'phone' => $row['phone'],
        'address' => $row['address'],
        'city' => $row['city'],
        'state' => $row['state'],
        'pincode' => $row['pincode']
    ];
} else {
    $response['message'] = "Customer profile data not found for user ID: " . $userId;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>