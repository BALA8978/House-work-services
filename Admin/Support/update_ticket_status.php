<?php
// File: /Admin/Support/update_ticket_status.php

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$ticket_id = $data['ticket_id'] ?? 0;
$status = $data['status'] ?? '';
$allowed_statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

if (empty($ticket_id) || !in_array($status, $allowed_statuses)) {
    $response['message'] = 'Invalid ticket ID or status provided.';
    echo json_encode($response);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE support_tickets SET status = ? WHERE ticket_id = ?");
    $stmt->bind_param("si", $status, $ticket_id);
    
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Ticket status updated successfully!';
    } else {
        throw new Exception('Could not update ticket status or ticket not found.');
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>