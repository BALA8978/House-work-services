<?php
ini_set('display_errors', 0); // Stops errors from showing in the browser
ini_set('log_errors', 1);    // Enables logging errors to a file
ini_set('error_log', __DIR__ . '/php-error.log'); // Sets the log file path
error_reporting(E_ALL);      // Ensures all types of errors are logged
// db_setup.php

$servername = "localhost"; // Your database server name
$username = "root";        // Your database username (e.g., "root")
$password = "";            // Your database password (e.g., "", or your password)
$dbname = "homecraft_pro_db"; // IMPORTANT: Corrected to your actual database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// --- Attempt to create customer_profiles table if it doesn't exist ---
// IMPORTANT: user_id is now INT UNSIGNED to exactly match users.id
$sql_create_table = "
CREATE TABLE IF NOT EXISTS customer_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL, -- Changed to INT UNSIGNED
    gender VARCHAR(10) DEFAULT 'female',
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    pincode VARCHAR(10) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
";

if ($conn->query($sql_create_table) === TRUE) {
    // Table created successfully or already exists.
    // echo "Table 'customer_profiles' checked/created successfully.<br>"; // Uncomment for debugging
} else {
    // Handle error if table creation fails
    die("Error creating table 'customer_profiles': " . $conn->error);
}

?>