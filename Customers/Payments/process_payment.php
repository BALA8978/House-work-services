<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'Authentication error. Please log in again.';
    echo json_encode($response);
    exit;
}

$payment_id = $data['payment_id'] ?? 0;

if (empty($payment_id)) {
    $response['message'] = 'Invalid payment ID.';
    echo json_encode($response);
    exit;
}

try {
    // This is a simulation. In a real app, you would process the payment via a gateway like Stripe first.
    // We are simply updating the status to 'Paid'.
    
    $stmt = $conn->prepare("UPDATE payments SET status = 'Paid', payment_date = NOW() WHERE payment_id = ? AND customer_id = ? AND status = 'Pending'");
    $stmt->bind_param("ii", $payment_id, $_SESSION['user_id']);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Payment processed successfully!';
    } else {
        $response['message'] = 'Payment could not be processed. It might have already been paid or an error occurred.';
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
