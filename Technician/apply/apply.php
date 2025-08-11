<?php
// Temporarily suppress all PHP errors and warnings from being displayed to the browser
// This is crucial for ensuring valid JSON output.
error_reporting(0);
ini_set('display_errors', 0);

session_start();

// Set the content type header to JSON
header('Content-Type: application/json');

// Initialize a default response array
$response = ['success' => false, 'message' => 'An unknown error occurred.'];

try {
    // --- IMPORTANT: Verify this path is correct for your server setup ---
    // If db_connect.php is in the same directory as apply.php, use 'db_connect.php'
    // If it's one level up, use '../db_connect.php'
    // If it's in a 'config' folder two levels up, use '../../config/db_connect.php'
    $db_connect_path = '../config/db_connect.php'; // Adjust this path if needed

    if (!file_exists($db_connect_path)) {
        $response['message'] = 'Database connection file not found. Please check the path in apply.php: ' . htmlspecialchars($db_connect_path);
        error_log("apply.php Error: Database connection file not found at " . $db_connect_path);
        echo json_encode($response);
        exit();
    }
    include $db_connect_path;

    // Check if the user is logged in
    if (!isset($_SESSION['user_id'])) {
        $response['message'] = 'You must be logged in to apply.';
        echo json_encode($response);
        exit();
    }

    // Retrieve form data
    $user_id = $_SESSION['user_id'];
    $full_name = $_POST['full_name'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $area = $_POST['area'] ?? '';
    $skills = $_POST['skills'] ?? '';

    // Basic validation for required fields
    if (empty($full_name) || empty($gender) || empty($phone_number) || empty($area) || empty($skills) || !isset($_FILES['documents']) || $_FILES['documents']['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'All fields are required, and a valid document must be uploaded.';
        echo json_encode($response);
        exit();
    }

    // Handle file upload for supporting documents
    $target_dir = "uploads/";
    // Create the uploads directory if it doesn't exist
    if (!is_dir($target_dir)) {
        // Attempt to create directory with recursive option and full permissions
        if (!mkdir($target_dir, 0777, true)) {
            $response['message'] = 'Failed to create upload directory. Please check server permissions.';
            error_log("apply.php Error: Failed to create upload directory at " . $target_dir);
            echo json_encode($response);
            exit();
        }
    }

    // Sanitize the uploaded file name to prevent directory traversal or other attacks
    $uploaded_file_name = preg_replace("/[^a-zA-Z0-9.\-_]/", "", basename($_FILES["documents"]["name"]));
    // Add unique ID to prevent overwrites and ensure unique paths
<<<<<<< HEAD
    $target_file = $target_dir . uniqid() . '_' . $uploaded_file_name;
=======
    $target_file = $target_dir . uniqid() . '_' . $uploaded_file_name; 
>>>>>>> 5399952a04f177fdbfcba053448f54e50fca2b46
    $documents_path = ''; // Initialize path

    // Check if file is an actual image or PDF using finfo_open for robust MIME type checking
    // Ensure the 'fileinfo' PHP extension is enabled in your php.ini
    if (!extension_loaded('fileinfo')) {
        $response['message'] = 'PHP fileinfo extension is not enabled. Please enable it in php.ini.';
        error_log("apply.php Error: PHP fileinfo extension is not enabled.");
        echo json_encode($response);
        exit();
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    // Check if the temporary file actually exists and is a valid uploaded file
    if (!is_uploaded_file($_FILES['documents']['tmp_name'])) {
        $response['message'] = 'Temporary file not found or not a valid upload. Please try again.';
        error_log("apply.php Error: Temporary upload file missing or invalid: " . $_FILES['documents']['tmp_name']);
        echo json_encode($response);
        exit();
    }
    $mime = finfo_file($finfo, $_FILES['documents']['tmp_name']);
    finfo_close($finfo);

    $allowed_mimes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!in_array($mime, $allowed_mimes)) {
        $response['message'] = 'Invalid file type. Only PDF, JPG, and PNG files are allowed.';
        error_log("apply.php Error: Invalid file MIME type detected: " . $mime);
        echo json_encode($response);
        exit();
    }

    // Check file size (5MB limit)
    if ($_FILES["documents"]["size"] > 5000000) {
        $response['message'] = 'Sorry, your file is too large. Maximum size is 5MB.';
        error_log("apply.php Error: Uploaded file size too large: " . $_FILES["documents"]["size"] . " bytes.");
        echo json_encode($response);
        exit();
    }

    // Move the uploaded file to the target directory using a relative path
    // This assumes 'uploads/' is a subdirectory of where apply.php is located.
<<<<<<< HEAD
    if (move_uploaded_file($_FILES["documents"]["tmp_name"], $target_file)) {
=======
    if (move_uploaded_file($_FILES["documents"]["tmp_name"], $target_file)) { 
>>>>>>> 5399952a04f177fdbfcba053448f54e50fca2b46
        $documents_path = $target_file;
    } else {
        // Log the specific upload error
        error_log("apply.php Error: File upload failed. Error code: " . $_FILES['documents']['error'] . " Temp name: " . $_FILES['documents']['tmp_name'] . " Target: " . $target_file);
        $response['message'] = 'Sorry, there was an error uploading your file. Please check server logs and permissions for the "uploads" folder.';
        echo json_encode($response);
        exit();
    }

<<<<<<< HEAD
    // Correct table name to match the database setup script
    $sql = "INSERT INTO pending__technicians (user_id, full_name, gender, phone_number, area, skills, documents_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')";
=======
    // Insert into technician_profiles table
    $sql = "INSERT INTO technician_profiles (user_id, full_name, gender, phone_number, area, skills, documents_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')";
>>>>>>> 5399952a04f177fdbfcba053448f54e50fca2b46
    $stmt = $conn->prepare($sql);

    // Check if the statement preparation was successful
    if ($stmt === false) {
        // Log the database preparation error
        error_log("apply.php Error: Database statement preparation failed: " . $conn->error);
        $response['message'] = 'Database statement preparation failed. Please contact support.';
        echo json_encode($response);
        exit();
    }

    // Bind parameters: 'i' for integer, 's' for string
    $bind_success = $stmt->bind_param("issssss", $user_id, $full_name, $gender, $phone_number, $area, $skills, $documents_path);

    if ($bind_success === false) {
        // Log the binding error
        error_log("apply.php Error: Binding parameters failed: " . $stmt->error);
        $response['message'] = 'Failed to bind parameters. Please contact support.';
        echo json_encode($response);
        exit();
    }

    // Execute the statement
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Application submitted successfully! You will be notified once it is reviewed.';
    } else {
        // Check for duplicate entry error (e.g., if user_id is unique and already exists)
        if ($conn->errno == 1062) {
            $response['message'] = 'You have already submitted an application.';
        } else {
            // Log the execution error
            error_log("apply.php Error: Database execution error: " . $stmt->error);
            $response['message'] = 'Failed to submit application. Please try again. Database Error: ' . $stmt->error;
        }
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // Catch any unexpected exceptions and log them
    error_log("apply.php Exception: " . $e->getMessage() . " on line " . $e->getLine() . " Stack: " . $e->getTraceAsString());
    $response['message'] = 'An unexpected server error occurred. Please try again later.';
}

// Always ensure a JSON response is sent at the very end
echo json_encode($response);
?>
