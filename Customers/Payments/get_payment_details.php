<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];
$payment_id = $_GET['payment_id'] ?? 0;

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

if (empty($payment_id)) {
    $response['message'] = 'Payment ID is required.';
    echo json_encode($response);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT amount, status FROM payments WHERE payment_id = ? AND customer_id = ?");
    $stmt->bind_param("ii", $payment_id, $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response['success'] = true;
        $response['data'] = $result->fetch_assoc();
    } else {
        $response['message'] = 'Payment not found or you do not have permission to view it.';
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
