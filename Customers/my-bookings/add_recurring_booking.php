<?php
require '../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'You must be logged in to add a service.';
    echo json_encode($response);
    exit;
}
$user_id = $_SESSION['user_id'];
$service_id = $data['service_id'] ?? 0;
if (empty($service_id)) {
    $response['message'] = 'Invalid service selected.';
    echo json_encode($response);
    exit;
}
try {
    $stmt = $conn->prepare("SELECT frequency FROM recurring_services WHERE service_id = ?");
    $stmt->bind_param("i", $service_id);
    $stmt->execute();
    $service = $stmt->get_result()->fetch_assoc();
    if (!$service) throw new Exception("Service not found.");
    $start_date = date('Y-m-d');
    $interval = $service['frequency'] === 'Weekly' ? 'P7D' : 'P1M';
    $next_service_date = (new DateTime($start_date))->add(new DateInterval($interval))->format('Y-m-d');
    $insert_stmt = $conn->prepare("INSERT INTO recurring_bookings (user_id, service_id, start_date, next_service_date, status) VALUES (?, ?, ?, ?, 'Active')");
    $insert_stmt->bind_param("iiss", $user_id, $service_id, $start_date, $next_service_date);
    if ($insert_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Recurring service added successfully!';
    } else {
        throw new Exception("Failed to add service.");
    }
} catch (Exception $e) {
    $response['message'] = 'Server Error: ' . $e->getMessage();
}
echo json_encode($response);
$conn->close();
?>