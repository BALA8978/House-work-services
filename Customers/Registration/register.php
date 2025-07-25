<?php
// Start session (optional for later use)
session_start();

// Include database connection
require_once '../database/connect.php';

// Check if form submitted via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize and fetch form values
    $full_name = trim($_POST["full_name"]);
    $email = trim($_POST["email"]);
    $password = $_POST["password"];
    $role = $_POST["role"];

    // Basic validation
    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        die("⚠️ All fields are required.");
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        die("❌ Email already registered.");
    }
    $stmt->close();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user into database
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $full_name, $email, $hashedPassword, $role);

    if ($stmt->execute()) {
        echo "✅ Registration successful! <a href='../LoginPage/index.html'>Click here to login</a>.";
    } else {
        echo "❌ Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "🚫 Invalid request.";
}
?>
