<?php
// Updates the profile for the logged-in technician.
session_start();
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Access denied. Please log in as a technician.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get data from POST request
$about = $_POST['about'] ?? '';
$specialty = $_POST['specialty'] ?? '';
$experience_level = $_POST['experience'] ?? ''; // Note: form ID is 'experience'
$skills = $_POST['skills'] ?? '[]';
$certificates = $_POST['certificates'] ?? '[]';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$city = $_POST['city'] ?? '';
$state = $_POST['state'] ?? '';
$pincode = $_POST['pincode'] ?? '';

// Update the technician_profiles table
$sql = "UPDATE technician_profiles SET
            about = ?, specialty = ?, experience_level = ?, skills = ?,
            certificates = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?
        WHERE user_id = ?";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssssssi",
    $about, $specialty, $experience_level, $skills, $certificates,
    $phone, $address, $city, $state, $pincode, $user_id
);

if ($stmt->execute()) {
    // Also update the technicians table for search consistency
    $updateSearchTable = $conn->prepare("UPDATE technicians SET services = ? WHERE user_id = ?");
    $skillsArray = json_decode($skills, true);
    $servicesString = implode(', ', $skillsArray);
    $updateSearchTable->bind_param("si", $servicesString, $user_id);
    $updateSearchTable->execute();
    $updateSearchTable->close();

    $response['success'] = true;
    $response['message'] = 'Profile updated successfully!';
} else {
    $response['message'] = 'Error updating profile: ' . $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>
