<?php
// Suppress PHP's HTML error output to ensure a clean JSON response
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require '../config/db_connect.php';

// Always set the content type to JSON at the very beginning
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => 'An unknown error occurred.'];

try {
    // Check for a valid database connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Ensure the user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Authentication required. Please log in to view payments.');
    }

    $customer_id = $_SESSION['user_id'];

    // CORRECTED SQL: Changed 'p.payment_status' to 'p.status'
    // We use 'AS payment_status' so the JSON output remains consistent for the JavaScript
    $sql = "SELECT
                p.payment_id,
                p.amount,
                p.status AS payment_status, -- Corrected column name with an alias
                p.payment_date,
                t.name AS technician_name,
                b.booking_date
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN technicians t ON p.technician_id = t.id
            WHERE p.customer_id = ?
            ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database prepare statement failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $customer_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Payments fetched successfully.';

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // If any error occurs in the 'try' block, it's caught here
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

// Finally, encode the response array into JSON and send it back
echo json_encode($response);
?>