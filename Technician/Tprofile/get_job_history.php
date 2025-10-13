<?php
// File: /Technician/Tprofile/get_job_history.php (Corrected and with better error handling)

// --- START: Robust Error Reporting ---
// This will display any fatal errors (like a bad file path) directly to the browser's response.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// --- END: Robust Error Reporting ---


// --- CORRECTED PATH ---
// The db_connect file is in the parent directory's 'config' folder.
require_once __DIR__ . '/../config/db_connect.php';

header('Content-Type: application/json');
$response = ['success' => false, 'data' => [], 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied: Session variables not set or role is not technician.';
    echo json_encode($response);
    exit;
}

$technician_user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT
                jh.booking_id,
                u.full_name AS customer_name,
                b.booking_date,
                jh.completion_status,
                jh.technician_notes,
                jh.work_photos_path,
                jh.completed_at
            FROM job_history jh
            JOIN bookings b ON jh.booking_id = b.booking_id
            JOIN users u ON jh.customer_user_id = u.id
            JOIN technicians t ON jh.technician_id = t.id
            WHERE t.user_id = ?
            ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $technician_user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (empty($data)) {
        $response['message'] = 'No job history found for this technician.';
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

$conn->close();
echo json_encode($response);
?>