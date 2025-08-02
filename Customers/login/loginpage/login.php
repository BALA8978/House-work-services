<?php
session_start();
// Use the new central connection file
require '../../config/db_connect.php'; 
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conn->real_escape_string(trim($_POST['email']));
    $password = trim($_POST['password']);

    $sql = "SELECT id, full_name, email, password, role FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_role'] = $user['role'];

            // Role-based redirection logic
            $redirect_url = '';
            if ($user['role'] == 'customer') {
                $redirect_url = '../../Dashbord/index.html';
            } else if ($user['role'] == 'technician') {
                $redirect_url = '../../Tprofile/profile.html';
            }

            echo json_encode([
                'success' => true, 
                'message' => 'Login Successful! Welcome, ' . htmlspecialchars($user['full_name']) . '.',
                'redirect' => $redirect_url
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
$conn->close();
?>
