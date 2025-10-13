<?php
// File: /Technician/Tprofile/update_technician_profile.php (Redesigned)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    $response['message'] = 'Authentication required.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$phone = $_POST['phone'] ?? '';
$area = $_POST['area'] ?? '';
$experience = $_POST['experience'] ?? 0;
$services = $_POST['services'] ?? '';
// For checkbox, 'on' is the default value if checked and no value is specified.
$isAvailable = isset($_POST['isAvailable']) && $_POST['isAvailable'] === 'on' ? 1 : 0;

$conn->begin_transaction();

try {
    // --- Handle Optional File Upload ---
    $documents_path_update_sql = "";
    if (isset($_FILES['documents']) && $_FILES['documents']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../apply/uploads/";
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        $file_name = uniqid() . '_' . basename($_FILES["documents"]["name"]);
        $target_file = $target_dir . $file_name;
        
        if (move_uploaded_file($_FILES["documents"]["tmp_name"], $target_file)) {
            $new_document_path = "uploads/" . $file_name; // Relative path for DB
            $documents_path_update_sql = ", documents_path = ?";
        } else {
            throw new Exception("Sorry, there was an error uploading your file.");
        }
    }

    // --- Update technician_profiles table ---
    // Added the optional documents_path part to the query
    $sql1 = "UPDATE technician_profiles SET phone_number = ?, area = ?, skills = ? $documents_path_update_sql WHERE user_id = ?";
    $stmt1 = $conn->prepare($sql1);
    
    if ($documents_path_update_sql) {
        // If file was uploaded, bind 5 params
        $stmt1->bind_param("ssssi", $phone, $area, $services, $new_document_path, $user_id);
    } else {
        // If no file, bind 4 params
        $stmt1->bind_param("sssi", $phone, $area, $services, $user_id);
    }
    $stmt1->execute();
    
    // --- Update technicians table ---
    $sql2 = "UPDATE technicians SET isAvailable = ?, experience = ?, services = ? WHERE user_id = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("iisi", $isAvailable, $experience, $services, $user_id);
    $stmt2->execute();

    if ($stmt1->error || $stmt2->error) {
        throw new Exception("Database update failed: " . $stmt1->error . " " . $stmt2->error);
    }
    
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Profile updated successfully!';
    
    $stmt1->close();
    $stmt2->close();

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>