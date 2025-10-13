<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

try {
    // Select all profiles regardless of status to show a complete history
    $sql = "SELECT profile_id, full_name, phone_number, skills, documents_path, status 
            FROM technician_profiles 
            ORDER BY FIELD(status, 'pending', 'approved', 'rejected'), profile_id DESC";
            
    $result = $conn->query($sql);

    if ($result) {
        $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
        $response['success'] = true;
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
