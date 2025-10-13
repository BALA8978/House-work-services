<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

$sql = "SELECT 
            jh.history_id,
            jh.booking_id,
            t.name AS technician_name,
            p.amount
        FROM job_history jh
        JOIN technicians t ON jh.technician_id = t.id
        JOIN payments p ON jh.booking_id = p.booking_id
        WHERE jh.payout_status = 'Ready'
        ORDER BY jh.completed_at ASC";

$result = $conn->query($sql);

if ($result) {
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $response['success'] = true;
}

echo json_encode($response);
$conn->close();
?>