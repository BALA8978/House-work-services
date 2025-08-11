<?php
// update_customer_profile.php

include 'db_setup.php'; // Include your database connection file

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = "Invalid request method. Only POST requests are accepted.";
    echo json_encode($response);
    exit();
}

// Check if user is logged in via session (assuming 'user_id' is set during login)
if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) { // Added is_numeric check
    $response['message'] = "User not logged in or invalid user ID in session.";
    echo json_encode($response);
    exit();
}

$userId = (int)$_SESSION['user_id']; // Cast to integer for safety

// Get data from POST request (using null coalescing operator for defaults)
$gender = $_POST['gender'] ?? '';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$city = $_POST['city'] ?? '';
$state = $_POST['state'] ?? '';
$pincode = $_POST['pincode'] ?? '';

// Server-side validation (basic)
if (empty($phone) || empty($city) || empty($state)) {
    $response['message'] = "Phone Number, City, and State are required fields.";
    echo json_encode($response);
    exit();
}

if (!preg_match('/^\d{10}$/', $phone)) {
    $response['message'] = "Phone number must be exactly 10 digits.";
    echo json_encode($response);
    exit();
}

// Check if a profile already exists for this user_id in customer_profiles table
$stmt_check = $conn->prepare("SELECT profile_id FROM customer_profiles WHERE user_id = ?");
if ($stmt_check === false) { // Check if prepare was successful
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
    $stmt_update = $conn->prepare("UPDATE customer_profiles SET gender = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE user_id = ?");
    if ($stmt_update === false) { // Check if prepare was successful
        $response['message'] = "Prepare statement failed for update: " . $conn->error;
        echo json_encode($response);
        exit();
    }
    // Correct bind_param: ssssssi (6 strings, 1 integer at the end)
    $stmt_update->bind_param("ssssssi", $gender, $phone, $address, $city, $state, $pincode, $userId);
    if ($stmt_update->execute()) {
        $response['success'] = true;
        $response['message'] = "Profile updated successfully!";
    } else {
        $response['message'] = "Error updating profile: " . $stmt_update->error;
    }
    $stmt_update->close();
} else {
    // Profile does not exist, so INSERT a new record
    $stmt_insert = $conn->prepare("INSERT INTO customer_profiles (user_id, gender, phone, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if ($stmt_insert === false) { // Check if prepare was successful
        $response['message'] = "Prepare statement failed for insert: " . $conn->error;
        echo json_encode($response);
        exit();
    }
    // Correct bind_param: issssss (1 integer, 6 strings)
    $stmt_insert->bind_param("issssss", $userId, $gender, $phone, $address, $city, $state, $pincode); // Line 71
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