<?php
session_start();
// Use the central database connection file
include '../../config/db_connect.php';

header('Content-Type: application/json');

$username = $_POST['username'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_BCRYPT);
$user_type = 'technician';

// Check if user already exists
$sql = "SELECT id FROM users WHERE email = ? OR username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'User with this email or username already exists.']);
    exit();
}

// Insert new user with 'technician' user_type
$sql = "INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $username, $email, $password, $user_type);

if ($stmt->execute()) {
    // Automatically log the user in by setting session variables
    $_SESSION['user_id'] = $stmt->insert_id;
    $_SESSION['username'] = $username;
    $_SESSION['user_type'] = $user_type;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

$stmt->close();
$conn->close();
?>
