<?php
// File: /Technician/jobs/resolve_job.php (MODIFIED)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied.';
    echo json_encode($response);
    exit;
}

$technician_user_id = $_SESSION['user_id'];
$booking_id = $_POST['booking_id'] ?? 0;
$completion_status = $_POST['completion_status'] ?? '';
$notes = $_POST['notes'] ?? '';
$hours = $_POST['hours'] ?? 0.0;
$cost = $_POST['cost'] ?? 0.0;

if (empty($booking_id) || empty($completion_status) || !in_array($completion_status, ['Success', 'Failed'])) {
    $response['message'] = 'Invalid or incomplete data provided for job resolution.';
    echo json_encode($response);
    exit;
}

$work_photos_path_str = null;
if (isset($_FILES['work_photos']) && !empty($_FILES['work_photos']['name'][0])) {
    $uploaded_file_paths = [];
    $upload_dir = '../../uploads/work_photos/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    foreach ($_FILES['work_photos']['name'] as $key => $name) {
        if ($_FILES['work_photos']['error'][$key] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['work_photos']['tmp_name'][$key];
            $file_extension = pathinfo($name, PATHINFO_EXTENSION);
            $unique_name = uniqid('workphoto_', true) . '.' . $file_extension;
            $destination = $upload_dir . $unique_name;
            if (move_uploaded_file($tmp_name, $destination)) {
                $uploaded_file_paths[] = 'uploads/work_photos/' . $unique_name;
            }
        }
    }
    $work_photos_path_str = !empty($uploaded_file_paths) ? implode(',', $uploaded_file_paths) : null;
}

$conn->begin_transaction();

try {
   
    $stmt = $conn->prepare("SELECT b.user_id, t.id FROM bookings b JOIN technicians t ON b.technician_id = t.id WHERE b.booking_id = ? AND t.user_id = ? AND b.status = 'Accepted' AND b.work_status = 'Pending'");
    $stmt->bind_param("ii", $booking_id, $technician_user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception('Job not found, not assigned to you, or has already been resolved.');
    }
    $verification_data = $result->fetch_assoc();
    $technician_id = $verification_data['id'];
    $customer_user_id = $verification_data['user_id'];
    $stmt->close();

    $work_status = ($completion_status === 'Success') ? 'Completed' : 'Failed';
    $update_stmt = $conn->prepare("UPDATE bookings SET work_status = ? WHERE booking_id = ?");
    $update_stmt->bind_param("si", $work_status, $booking_id);
    $update_stmt->execute();
    $update_stmt->close();

    $payout_status = ($completion_status === 'Success') ? 'Ready' : 'Pending';
    
    $history_stmt = $conn->prepare("INSERT INTO job_history (booking_id, technician_id, customer_user_id, completion_status, technician_notes, work_photos_path, materials_cost, hours_spent, payout_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $history_stmt->bind_param("isisssdds", $booking_id, $technician_id, $customer_user_id, $completion_status, $notes, $work_photos_path_str, $cost, $hours, $payout_status);
    $history_stmt->execute();

    if ($history_stmt->affected_rows > 0) {
        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Job has been successfully resolved!';
    } else {
        throw new Exception('Failed to create job history record.');
    }
    $history_stmt->close();

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>