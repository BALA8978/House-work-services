<?php
require '../../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

$technician_id = $_POST['technician_id'] ?? '';
$booking_date = $_POST['booking_date'] ?? '';
$booking_time = $_POST['booking_time'] ?? '';
$jobs = $_POST['jobs'] ?? [];

if (empty($technician_id) || empty($booking_date) || empty($booking_time) || empty($jobs)) {
    $response['message'] = 'Please fill all required fields and add at least one job.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();
try {
    $sql = "INSERT INTO bookings (user_id, technician_id, booking_date, booking_time, work_description, status) VALUES (?, ?, ?, ?, ?, 'Accepted')";
    $stmt = $conn->prepare($sql);

    foreach ($jobs as $job) {
        $user_id = $job['user_id'];
        $description = $job['description'];
        $stmt->bind_param("issss", $user_id, $technician_id, $booking_date, $booking_time, $description);
        $stmt->execute();
    }

    $conn->commit();
    $response['success'] = true;
    $response['message'] = count($jobs) . ' jobs have been successfully scheduled!';

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>