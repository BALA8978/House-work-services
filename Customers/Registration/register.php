<?php
// ... (your existing database connection and SQL table setup comments) ...

// File: /database/connect.php (This comment is for clarity, the file is separate)

// ... (your existing database connection code, not part of register.php content) ...

/*
================================================================================
PART 3: UPDATED REGISTRATION SCRIPT
================================================================================
- This is the code for your 'register.php' file.
- It handles the form submission, saves the data, and redirects the user.
*/

// File: /Registration/register.php (Relative path based on your folder structure)

// Start the session to potentially store user data after login
session_start();

// Include the database connection file from Part 1
// The path 'database/connect.php' is correct if register.php is in 'Registration'
// and 'database' is a sibling folder to 'Registration'.
require_once '../database/connect.php'; // Corrected path

// Check if the form was submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Sanitize and retrieve form values to prevent XSS attacks
    $full_name = trim($_POST["full_name"]);
    $email     = trim($_POST["email"]);
    $password  = $_POST["password"];
    $role      = $_POST["role"];

    // --- Data Validation ---
    // Check if any of the required fields are empty
    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        $_SESSION['error_message'] = "⚠️ All fields are required.";
        header("Location: ../signup-page/index.html"); // Assuming signup-page is the previous directory
        exit();
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Validation Error: Invalid email format.");
    }

    // --- Check for Existing User ---
    // Prepare a statement to check if the email already exists to prevent duplicates
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    // If a row is found, the email is already registered
    if ($stmt->num_rows > 0) {
        $stmt->close();
        $conn->close();
        // Provide a user-friendly message and a link to the login page
        // Assumes loginpage/index.html is one level up from Registration
        die("Error: This email address is already registered. Please <a href='../loginpage/index.html'>login here</a>.");
    }
    $stmt->close();

    // --- Password Hashing ---
    // Hash the password for security before storing it in the database
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // --- Insert New User ---
    // Prepare the INSERT statement to add the new user to the database
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $full_name, $email, $hashedPassword, $role);

    // Execute the statement and check if it was successful
    if ($stmt->execute()) {
        // --- REDIRECTION LOGIC ---
        // If registration is successful, redirect based on the selected role.
        
        // IMPORTANT: Create these profile pages or change the file names to match yours.
        if ($role === 'customer') {
            // Redirect to the customer's profile page
            // Path from 'Registration' to 'Customers/Cprofile.html'
            header('Location: ../');
            exit(); // Terminate script execution after redirection
        } elseif ($role === 'technician') {
            // Redirect to the technician's profile page
            // Path from 'Registration' to 'Tprofile/Tprofile.html'
            header('Location: ../Tprofile/Tprofile.html');
            exit(); // Terminate script execution after redirection
        } else {
            // Fallback in case the role is something unexpected
            die("Registration successful, but role is invalid.");
        }

    } else {
        // If execution fails, show a generic error message
        echo "Error: An error occurred during registration. Please try again later.";
        // For debugging, you can uncomment the line below to see the specific error
        // echo "Error: " . $stmt->error;
    }

    // Close the statement and the database connection
    $stmt->close();
    $conn->close();

} else {
    // If the script is accessed directly without a POST request, show an error
    echo "Invalid request method. This page cannot be accessed directly.";
}
?>