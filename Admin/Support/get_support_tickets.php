<?php
// File: /Admin/Support/get_support_tickets.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

try {
    $sql = "SELECT 
                st.ticket_id,
                st.booking_id,
                u.full_name AS customer_name,
                st.subject,
                st.description,
                st.status,
                st.created_at
            FROM support_tickets st
            JOIN users u ON st.user_id = u.id
            ORDER BY st.created_at DESC";
            
    $result = $conn->query($sql);
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>