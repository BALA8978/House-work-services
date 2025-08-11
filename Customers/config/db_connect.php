<?php
// --- Central Database Connection ---
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// --- Database Credentials ---
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "homecraft_pro_db";

// --- Create and Check Connection ---
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}
?>