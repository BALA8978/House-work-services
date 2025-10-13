<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'Authentication required. Please log in.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$city = $_POST['city'] ?? '';
$state = $_POST['state'] ?? '';
$pincode = $_POST['pincode'] ?? '';
// Note: We are not updating email or gender from this form as per the UI design

try {
    // Using INSERT...ON DUPLICATE KEY UPDATE is an efficient way to handle both new and existing profiles.
    // It requires a UNIQUE key on the `user_id` column in `customer_profiles`.
    $sql = "INSERT INTO customer_profiles (user_id, phone, address, city, state, pincode)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            phone = VALUES(phone),
            address = VALUES(address),
            city = VALUES(city),
            state = VALUES(state),
            pincode = VALUES(pincode)";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssss", $user_id, $phone, $address, $city, $state, $pincode);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Profile updated successfully!';
    } else {
        throw new Exception('Failed to update profile in the database.');
    }
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
