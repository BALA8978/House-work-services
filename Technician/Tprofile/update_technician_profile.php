<?php
// update_technician_profile.php

include '../config/db_connect.php'; // Use the central database connection file

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Invalid request method. Only POST requests are accepted.";
    echo json_encode($response);
    exit();
}

if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    $response['message'] = "User not logged in or invalid user ID in session.";
    echo json_encode($response);
    exit();
}

$userId = (int)$_SESSION['user_id'];

$about = $_POST['about'] ?? '';
$specialty = $_POST['specialty'] ?? '';
$experience_level = $_POST['experience_level'] ?? '';
$skills = $_POST['skills'] ?? '';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$city = $_POST['city'] ?? '';
$state = $_POST['state'] ?? '';
$pincode = $_POST['pincode'] ?? '';

// Basic validation for required fields
if (empty($phone) || empty($city) || empty($state) || empty($specialty)) {
    $response['message'] = "Specialty, Phone Number, City, and State are required fields.";
    echo json_encode($response);
    exit();
}

// Check if a profile already exists for this user_id
$stmt_check = $conn->prepare("SELECT profile_id FROM technician_profiles WHERE user_id = ?");
if ($stmt_check === false) {
    $response['message'] = "Prepare statement failed for profile check: " . $conn->error;
    echo json_encode($response);
    exit();
}
$stmt_check->bind_param("i", $userId);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$stmt_check->close();

if ($result_check->num_rows > 0) {
    // Profile exists, so UPDATE
    $stmt_update = $conn->prepare("UPDATE technician_profiles SET about = ?, specialty = ?, experience_level = ?, skills = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE user_id = ?");
    if ($stmt_update === false) {
        $response['message'] = "Prepare statement failed for update: " . $conn->error;
        echo json_encode($response);
        exit();
    }
    $stmt_update->bind_param("sssssssssi", $about, $specialty, $experience_level, $skills, $phone, $address, $city, $state, $pincode, $userId);
    if ($stmt_update->execute()) {
        $response['success'] = true;
        $response['message'] = "Profile updated successfully!";
    } else {
        $response['message'] = "Error updating profile: " . $stmt_update->error;
    }
    $stmt_update->close();
} else {
    // Profile does not exist, so INSERT a new record
    $stmt_insert = $conn->prepare("INSERT INTO technician_profiles (user_id, about, specialty, experience_level, skills, phone, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt_insert === false) {
        $response['message'] = "Prepare statement failed for insert: " . $conn->error;
        echo json_encode($response);
        exit();
    }
    $stmt_insert->bind_param("isssssssss", $userId, $about, $specialty, $experience_level, $skills, $phone, $address, $city, $state, $pincode);
    if ($stmt_insert->execute()) {
        $response['success'] = true;
        $response['message'] = "New profile created successfully!";
    } else {
        $response['message'] = "Error creating new profile: " . $stmt_insert->error;
    }
    $stmt_insert->close();
}

$conn->close();

echo json_encode($response);
?>
