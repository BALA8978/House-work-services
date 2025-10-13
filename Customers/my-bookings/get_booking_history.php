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
    $sql = "SELECT b.booking_id, t.name AS technician_name, b.booking_date, b.booking_time, b.status AS booking_status, p.status AS payment_status, b.work_status, oj.is_customer_approved
            FROM bookings b
            LEFT JOIN technicians t ON b.technician_id = t.id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            LEFT JOIN open_jobs oj ON b.booking_id = oj.booking_id
            WHERE b.user_id = ? ORDER BY b.booking_date DESC, b.booking_time DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = [];
    $today = new DateTime();
    $today->setTime(0,0,0);
    while($row = $result->fetch_assoc()) {
        $bookingDate = new DateTime($row['booking_date']);
        $displayStatus = 'Processing';
        if ($row['booking_status'] === 'Rejected') {
            $displayStatus = ($row['is_customer_approved'] == 0) ? 'Technician Rejected' : 'Searching for Technician';
        } elseif ($row['work_status'] === 'Completed' || $row['work_status'] === 'Failed') {
            $displayStatus = 'Completed';
        } elseif ($row['booking_status'] === 'Cancelled') {
            $displayStatus = 'Cancelled';
        } elseif ($row['booking_status'] === 'Accepted') {
            $displayStatus = ($bookingDate < $today) ? 'Past Due' : 'Upcoming';
        } elseif ($row['booking_status'] === 'Confirmed') {
             $displayStatus = 'Pending Confirmation';
        }
        $row['display_status'] = $displayStatus;
        $row['technician_name'] = $row['technician_name'] ?? 'To Be Assigned';
        $data[] = $row;
    }
    $response['success'] = true;
    $response['data'] = $data;
    $stmt->close();
} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>