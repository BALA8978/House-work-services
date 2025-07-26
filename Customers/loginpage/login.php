<?php
session_start(); // Start the session

// Include database connection
require_once '../database/connect.php';

// Check if form submitted via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Fetch and sanitize input
    $email = trim($_POST["email"]);
    $password = $_POST["password"];

    // Validate inputs
    if (empty($email) || empty($password)) {
        die("⚠️ Please enter both email and password.");
    }

    // Fetch user from database
    $stmt = $conn->prepare("SELECT id, full_name, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    // Check if user exists
    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $full_name, $hashedPassword, $role);
        $stmt->fetch();

        // Verify password
        if (password_verify($password, $hashedPassword)) {
            // Store user info in session
            $_SESSION["user_id"] = $id;
            $_SESSION["full_name"] = $full_name;
            $_SESSION["role"] = $role;

            // Redirect to dashboard (customize by role if needed)
            header("Location: ../Dashboard/index.html");
            exit();
        } else {
            die("❌ Invalid password.");
        }
    } else {
        die("❌ No account found with that email.");
    }

    $stmt->close();
    $conn->close();
} else {
    echo "🚫 Invalid request method.";
}
?>
