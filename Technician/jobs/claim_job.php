<?php
// File: /Technician/jobs/claim_job.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$booking_id = $data['booking_id'] ?? 0;
$technician_user_id = $_SESSION['user_id'];

if (empty($booking_id)) {
    $response['message'] = 'Invalid booking ID provided.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {
    // Get the new technician's ID
    $tech_stmt = $conn->prepare("SELECT id FROM technicians WHERE user_id = ?");
    $tech_stmt->bind_param("i", $technician_user_id);
    $tech_stmt->execute();
    $tech_result = $tech_stmt->get_result();
    if ($tech_result->num_rows === 0) {
        throw new Exception('Claiming technician identity not found.');
    }
    $new_technician_id = $tech_result->fetch_assoc()['id'];
    $tech_stmt->close();

    // Atomically update the booking to assign the new technician.
    $update_stmt = $conn->prepare("UPDATE bookings SET technician_id = ?, status = 'Accepted' WHERE booking_id = ? AND technician_id IS NULL");
    $update_stmt->bind_param("si", $new_technician_id, $booking_id);
    $update_stmt->execute();

    if ($update_stmt->affected_rows > 0) {
        // If successful, remove the job from the open pool.
        $delete_stmt = $conn->prepare("DELETE FROM open_jobs WHERE booking_id = ?");
        $delete_stmt->bind_param("i", $booking_id);
        $delete_stmt->execute();
        
        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Job successfully claimed!';
    } else {
        throw new Exception('This job has just been claimed by another technician.');
    }
    $update_stmt->close();

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>