<?php
/*
 * File: register.php (Updated for Immediate Login & Redirect)
 *
 * This script now automatically logs in a new user upon successful registration.
 * If the user is a technician, it allows the front-end to redirect them
 * straight to the application form.
 */

// Start the session at the very beginning
session_start();

// Set the header to specify JSON content
header('Content-Type: application/json');

// Include the database connection
require 'db_connect.php'; 

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = trim($_POST['role'] ?? '');

    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        $response['message'] = "Error: All fields are required.";
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $full_name, $email, $hashed_password, $role);

        if ($stmt->execute()) {
            // Get the ID of the new user that was just created
            $new_user_id = $conn->insert_id;

            // --- AUTOMATIC LOGIN ---
            // Set session variables immediately after creating the account
            $_SESSION['user_id'] = $new_user_id;
            $_SESSION['username'] = $full_name; // Using full_name as username for the session
            $_SESSION['role'] = $role;

            $response['success'] = true;
            $response['message'] = "Redirecting...";
            $response['role'] = $role; // Send the role back to the JavaScript

        } else {
            if ($conn->errno == 1062) {
                $response['message'] = "Error: This email address is already registered.";
            } else {
                $response['message'] = "Error during registration: " . $stmt->error;
            }
        }
        $stmt->close();
    }
} else {
    $response['message'] = 'Invalid request method.';
}

$conn->close();
echo json_encode($response);
?>