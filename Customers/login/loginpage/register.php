<?php
/*
 * File: register.php
 *
 * This script handles the user registration form submission.
 * It receives data from the registration form, validates it,
 * hashes the password, and inserts the new user into the database.
 */

// --- Step 1: Include the database connection file ---
// This makes the $conn variable available for use in this script.
require 'db_connect.php';

// --- Step 2: Check if the form was submitted using POST ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- Step 3: Retrieve and Sanitize Form Data ---
    // Use trim() to remove any leading/trailing whitespace.
    // Use real_escape_string to prevent basic SQL injection.
    $full_name = $conn->real_escape_string(trim($_POST['full_name']));
    $email = $conn->real_escape_string(trim($_POST['email']));
    $password = trim($_POST['password']); // We'll hash this, so no need to escape.
    $role = $conn->real_escape_string(trim($_POST['role']));

    // --- Step 4: Validate the data (basic validation) ---
    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        die("Error: All fields are required.");
    }

    // --- Step 5: Hash the password for security ---
    // This is a CRITICAL security step. Never store plain-text passwords.
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // --- Step 6: Prepare and Execute the SQL Statement ---
    // Use a prepared statement to prevent SQL injection effectively.
    $sql = "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)";

    // Prepare the statement
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        die("Error preparing the statement: " . $conn->error);
    }

    // Bind parameters to the statement ('ssss' means four string parameters)
    $stmt->bind_param("ssss", $full_name, $email, $hashed_password, $role);

    // Execute the statement and check for success
    if ($stmt->execute()) {
        echo "Registration successful! You can now log in.";
    } else {
        // Check for a duplicate email error
        if ($conn->errno == 1062) { // 1062 is the MySQL error code for duplicate entry
            echo "Error: This email address is already registered.";
        } else {
            echo "Error during registration: " . $stmt->error;
        }
    }

    // --- Step 7: Close the statement ---
    $stmt->close();

} else {
    // If the script is accessed directly without a POST request, show an error.
    echo "Invalid request method.";
}

// --- Step 8: Close the database connection ---
$conn->close();
?>
