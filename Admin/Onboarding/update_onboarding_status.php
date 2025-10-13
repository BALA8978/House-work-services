<?php
// File: /Admin/Onboarding/update_onboarding_status.php (Corrected and Final Version)

require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$profileId = $data['profile_id'] ?? 0;
$newStatus = $data['status'] ?? '';

if (empty($profileId) || !in_array($newStatus, ['approved', 'rejected'])) {
    $response['message'] = 'Invalid data provided.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {
    // Step 1: Update the status in the technician_profiles table
    $stmt1 = $conn->prepare("UPDATE technician_profiles SET status = ? WHERE profile_id = ?");
    $stmt1->bind_param("si", $newStatus, $profileId);
    if (!$stmt1->execute()) {
        throw new Exception("Failed to update profile status: " . $stmt1->error);
    }
    $stmt1->close();

    // Step 2: If approved, insert the new technician into the main 'technicians' table
    if ($newStatus === 'approved') {
        
        // First, get the details of the approved applicant
        $get_profile_stmt = $conn->prepare(
            "SELECT user_id, full_name, skills FROM technician_profiles WHERE profile_id = ?"
        );
        $get_profile_stmt->bind_param("i", $profileId);
        $get_profile_stmt->execute();
        $profile_result = $get_profile_stmt->get_result();

        if ($profile_result->num_rows > 0) {
            $profile_data = $profile_result->fetch_assoc();
            
            // Generate a unique technician ID, e.g., TECH123
            $technician_id = 'TECH' . str_pad($profile_data['user_id'], 3, '0', STR_PAD_LEFT);
            
            // Prepare the insert statement for the 'technicians' table
            // Default values are set for rating, experience, price, etc.
            $insert_stmt = $conn->prepare(
                "INSERT INTO technicians (id, user_id, name, services, isAvailable, rating, experience, price) 
                 VALUES (?, ?, ?, ?, 1, 4.0, 1, 500)
                 ON DUPLICATE KEY UPDATE name=VALUES(name), services=VALUES(services)" // This prevents errors if an admin accidentally approves someone twice
            );
            $insert_stmt->bind_param(
                "siss", 
                $technician_id, 
                $profile_data['user_id'], 
                $profile_data['full_name'], 
                $profile_data['skills']
            );
            
            if (!$insert_stmt->execute()) {
                throw new Exception("Failed to insert into technicians table: " . $insert_stmt->error);
            }
            $insert_stmt->close();
        } else {
            throw new Exception("Could not find the profile to approve.");
        }
        $get_profile_stmt->close();
    }

    $conn->commit();
    $response['success'] = true;
    $response['message'] = "Technician status updated successfully!";

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'A server error occurred: ' . $e->getMessage();
    http_response_code(500);
}

$conn->close();
echo json_encode($response);
?>
