<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // This query gets completed job details from the job_history table,
    // joining with bookings and technicians to get relevant names and dates.
    $sql = "SELECT 
                jh.booking_id,
                t.name AS technician_name,
                b.booking_date,
                jh.completion_status,
                jh.technician_notes
            FROM job_history jh
            JOIN bookings b ON jh.booking_id = b.booking_id
            JOIN technicians t ON jh.technician_id = t.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
