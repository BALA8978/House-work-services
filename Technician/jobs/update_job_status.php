<?php
// File: /Technician/jobs/update_job_status.php

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
$status = $data['status'] ?? ''; // 'Accepted' or 'Rejected'
$reason = $data['reason'] ?? ''; // New field for rejection reason
$technician_user_id = $_SESSION['user_id'];

if (empty($booking_id) || !in_array($status, ['Accepted', 'Rejected'])) {
    $response['message'] = 'Invalid booking ID or status provided.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {
    // Get the technician's unique ID (e.g., 'TECH001')
    $tech_stmt = $conn->prepare("SELECT id FROM technicians WHERE user_id = ?");
    $tech_stmt->bind_param("i", $technician_user_id);
    $tech_stmt->execute();
    $tech_result = $tech_stmt->get_result();
    if ($tech_result->num_rows === 0) {
        throw new Exception('Technician identity not found.');
    }
    $technician_id = $tech_result->fetch_assoc()['id'];
    $tech_stmt->close();

    if ($status === 'Accepted') {
        $stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE booking_id = ? AND technician_id = ? AND status = 'Confirmed'");
        $stmt->bind_param("sis", $status, $booking_id, $technician_id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = "Job has been successfully Accepted.";
        } else {
            $response['message'] = 'Could not accept job. It may have been actioned already.';
        }
    } 
    elseif ($status === 'Rejected') {
        // --- NEW REJECTION WORKFLOW ---
        // 1. Create a record in the open_jobs table
        $open_job_stmt = $conn->prepare("INSERT INTO open_jobs (booking_id, original_technician_id, reason_for_rejection) VALUES (?, ?, ?)");
        $open_job_stmt->bind_param("iss", $booking_id, $technician_id, $reason);
        $open_job_stmt->execute();
        $open_job_stmt->close();

        // 2. Unassign the technician and update the status to alert the customer
        $booking_update_stmt = $conn->prepare("UPDATE bookings SET technician_id = NULL, status = 'Rejected' WHERE booking_id = ? AND technician_id = ?");
        $booking_update_stmt->bind_param("is", $booking_id, $technician_id);
        $booking_update_stmt->execute();
        
        if ($booking_update_stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Job has been rejected. The customer will be notified to find a new technician.';
        } else {
            throw new Exception('Failed to update the booking for rejection.');
        }
        $booking_update_stmt->close();
    }
    
    $conn->commit();

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'Server Error: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>