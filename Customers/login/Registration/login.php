<?php
session_start();
// Use the central database connection file
include '../../../config/db_connect.php'; 

header('Content-Type: application/json');

$email = $_POST['email'];
$password = $_POST['password'];

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

// Fetch user from the database
$sql = "SELECT id, username, password, user_type FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_type'] = $user['user_type'];

        // Handle redirection based on user type
        if ($user['user_type'] === 'customer') {
            echo json_encode(['success' => true, 'user_type' => 'customer']);
        } elseif ($user['user_type'] === 'technician') {
            // For technicians, check their profile status
            $profile_sql = "SELECT status FROM technician_profiles WHERE user_id = ?";
            $profile_stmt = $conn->prepare($profile_sql);
            $profile_stmt->bind_param("i", $user['id']);
            $profile_stmt->execute();
            $profile_result = $profile_stmt->get_result();

            if ($profile_result->num_rows === 1) {
                $profile = $profile_result->fetch_assoc();
                // Send status to the client-side script to handle redirection
                echo json_encode(['success' => true, 'user_type' => 'technician', 'status' => $profile['status']]);
            } else {
                // Technician has registered but not yet filled out the application form
                echo json_encode(['success' => true, 'user_type' => 'technician', 'status' => 'not_applied']);
            }
            $profile_stmt->close();
        } else {
             // Handle other user types if any, like admin
             echo json_encode(['success' => true, 'user_type' => $user['user_type']]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
}

$stmt->close();
$conn->close();
?>
