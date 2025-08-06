<?php
/*
 * File: db_connect.php
 *
 * This file establishes the connection to the MySQL database.
 * It will be included in other PHP files that need database access.
 */

// --- Database Connection Variables ---
// These should match the details you used in the database_setup.php file.
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "homecraft_pro_db";

// --- Create and Check the Connection ---
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for a connection error. If there is one, stop the script
// and display a detailed error message.
if ($conn->connect_error) {
    // Using die() will immediately stop the script's execution.
    die("Connection failed: " . $conn->connect_error);
}

// If the script reaches this point, the connection was successful.
// The $conn variable can now be used by any script that includes this file.
?>
