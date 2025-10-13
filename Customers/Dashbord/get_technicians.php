<?php
// File: /Customers/Dashbord/get_technicians.php (Corrected)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = [
    'success' => false,
    'data' => [],
    'message' => ''
];

try {
    // We select all technicians who are marked as available.
    // We also join with the technician_profiles to get the gender for the avatar image.
    $sql = "SELECT 
                t.id, 
                t.name, 
                t.rating, 
                t.experience, 
                t.services, 
                t.price,
                tp.gender
            FROM technicians t
            LEFT JOIN technician_profiles tp ON t.user_id = tp.user_id
            WHERE t.isAvailable = 1";

    $result = $conn->query($sql);

    if ($result) {
        $technicians = $result->fetch_all(MYSQLI_ASSOC);
        $response['success'] = true;
        $response['data'] = $technicians;
    } else {
        throw new Exception("Failed to fetch technicians from the database.");
    }

} catch (Exception $e) {
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();

?>