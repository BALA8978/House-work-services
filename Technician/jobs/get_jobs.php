<?php


require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => [], 'message' => ''];

// CORRECTED: Checking for 'user_role' to match the login script
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access Denied. Please log in as a technician.';
    echo json_encode($response);
    exit;
}

$technician_user_id = $_SESSION['user_id'];

try {
    $tech_stmt = $conn->prepare("SELECT id FROM technicians WHERE user_id = ?");
    $tech_stmt->bind_param("i", $technician_user_id);
    $tech_stmt->execute();
    $tech_result = $tech_stmt->get_result();
    if ($tech_result->num_rows === 0) {
        throw new Exception('Technician identity not found.');
    }
    $technician_id = $tech_result->fetch_assoc()['id'];
    $tech_stmt->close();

    $sql = "SELECT 
                b.booking_id,
                u.full_name AS customer_name,
                cp.address,
                cp.city,
                cp.pincode,
                b.booking_date,
                b.booking_time,
                b.work_description,
                p.status AS payment_status
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN customer_profiles cp ON u.id = cp.user_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.technician_id = ? AND b.status = 'Confirmed'
            ORDER BY b.booking_date, b.booking_time";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $technician_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $response['success'] = true;
    $response['data'] = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>