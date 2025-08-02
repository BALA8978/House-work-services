<?php
require '../../config/db_connect.php'; // Corrected path
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = trim($_POST['full_name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $role = trim($_POST['role']);

    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        $response['message'] = 'All fields are required.';
        echo json_encode($response);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $conn->begin_transaction();

    try {
        // Insert into users table
        $stmt1 = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
        $stmt1->bind_param("ssss", $full_name, $email, $hashed_password, $role);
        $stmt1->execute();
        $user_id = $conn->insert_id;
        $stmt1->close();

        // If the user is a technician, create corresponding entries in other tables
        if ($role === 'technician') {
            $technician_id_str = 'TECH' . $user_id;
            // Insert into technicians table (for searching)
            $stmt2 = $conn->prepare("INSERT INTO technicians (id, user_id, name) VALUES (?, ?, ?)");
            $stmt2->bind_param("sis", $technician_id_str, $user_id, $full_name);
            $stmt2->execute();
            $stmt2->close();
            
            // Insert a blank profile into technician_profiles
            $stmt3 = $conn->prepare("INSERT INTO technician_profiles (user_id) VALUES (?)");
            $stmt3->bind_param("i", $user_id);
            $stmt3->execute();
            $stmt3->close();
        } else {
             // Insert a blank profile into customer_profiles
            $stmt4 = $conn->prepare("INSERT INTO customer_profiles (user_id) VALUES (?)");
            $stmt4->bind_param("i", $user_id);
            $stmt4->execute();
            $stmt4->close();
        }

        $conn->commit();
        $response['success'] = true;
        $response['message'] = 'Registration successful! You can now log in.';
    } catch (mysqli_sql_exception $exception) {
        $conn->rollback();
        if ($conn->errno == 1062) {
            $response['message'] = 'This email address is already registered.';
        } else {
            $response['message'] = 'Database error: ' . $exception->getMessage();
        }
    }

    echo json_encode($response);

} else {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
}

$conn->close();
?>
