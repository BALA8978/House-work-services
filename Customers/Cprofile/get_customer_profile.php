<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'message' => ''];

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // This query joins the users table with the customer_profiles table
    // to get all information in a single call.
    $sql = "SELECT 
                u.full_name AS userName, 
                u.email AS userEmail,
                cp.gender,
                cp.phone,
                cp.address,
                cp.city,
                cp.state,
                cp.pincode
            FROM users u
            LEFT JOIN customer_profiles cp ON u.id = cp.user_id
            WHERE u.id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response['success'] = true;
        $response['data'] = $result->fetch_assoc();
    } else {
        $response['message'] = 'User profile not found.';
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
