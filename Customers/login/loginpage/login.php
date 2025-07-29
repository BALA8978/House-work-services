<?php
/*
 * File: login.php
 *
 * This script handles the user login process. It verifies credentials against the database,
 * starts a session, and returns a personalized JSON response.
 */

// Start a session to store user data after successful login.
session_start();

// Include the database connection file.
require 'db_connect.php';

// Set the header to indicate the response will be in JSON format.
header('Content-Type: application/json');

// Process the request only if it's a POST request.
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Get email and password from the form, trimming whitespace.
    // Use real_escape_string to help prevent SQL injection.
    $email = $conn->real_escape_string(trim($_POST['email']));
    $password = trim($_POST['password']);

    // Prepare a SQL statement to safely query the database.
    $sql = "SELECT id, full_name, email, password, role FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => 'Server error: Could not prepare statement.']);
        exit;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if a user with that email exists.
    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        // Verify the submitted password against the hashed password in the database.
        if (password_verify($password, $user['password'])) {
            // Password is correct. Login is successful.
            
            // Store user info in the session to use on other pages.
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_role'] = $user['role'];

            // Create a personalized success message.
            $success_message = "Login Successful! Welcome, " . htmlspecialchars($user['full_name']) . ".";
            echo json_encode(['success' => true, 'message' => $success_message]);

        } else {
            // Password does not match.
            echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        }
    } else {
        // No user found with that email.
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }

    $stmt->close();

} else {
    // Handle cases where the script is accessed directly.
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>
