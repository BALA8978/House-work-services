<?php
// Enable error reporting for development (remove or comment out in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database credentials
$host = 'localhost';
$user = 'root'; // Default XAMPP user
$pass = '';     // Default XAMPP password (blank)
$db   = 'homecraft_pro_db'; // The database name created by setup_database.php

// Set content type to JSON
header('Content-Type: application/json');

// Connect to MySQL database
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    // If database connection fails, send a 500 Internal Server Error and JSON response
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Query to get technician details
// Ensure column names match your database table exactly
$sql = "SELECT id, name, isAvailable, rating, experience, services, price FROM technicians";
$result = $conn->query($sql);

$technicians = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert services TEXT into array assuming comma-separated values
        // Trim each service to remove leading/trailing whitespace
        $services = [];
        if (!empty($row['services'])) {
            $services = array_map('trim', explode(',', $row['services']));
        }

        // Cast numeric values to appropriate types for consistency with JavaScript
        $technicians[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            // Convert isAvailable to a boolean true/false
            'isAvailable' => (boolval($row['isAvailable'])),
            'rating' => floatval($row['rating']),
            'experience' => intval($row['experience']),
            'services' => $services,
            'price' => intval($row['price'])
        ];
    }
}

// Encode the array of technicians as JSON and output it
echo json_encode($technicians);

// Close the database connection
$conn->close();
?>