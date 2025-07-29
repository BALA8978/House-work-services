<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ['success' => false, 'message' => 'Invalid request'];

if (isset($_POST['technician_id']) && isset($_POST['date']) && isset($_POST['time'])) {
    $technician_id = $_POST['technician_id'];
    $date = $_POST['date'];
    $time = $_POST['time'];

    // Start a transaction to ensure both operations succeed or fail together.
    $conn->begin_transaction();

    try {
        // First, check if the technician is still available in the technicians_details table.
        // 'FOR UPDATE' locks the row to prevent other users from booking this technician simultaneously.
        $sql_check_avail = "SELECT isAvailable FROM technicians_details WHERE id = ? FOR UPDATE";
        $stmt_check_avail = $conn->prepare($sql_check_avail);
        $stmt_check_avail->bind_param("s", $technician_id);
        $stmt_check_avail->execute();
        $result_avail = $stmt_check_avail->get_result();
        $technician = $result_avail->fetch_assoc();
        $stmt_check_avail->close();

        // If technician not found or isAvailable is already 0, throw an error.
        if (!$technician || $technician['isAvailable'] == 0) {
            throw new Exception('Sorry, this technician is no longer available.');
        }

        // Second, check if the specific time slot is already booked in the bookings table.
        $sql_check_slot = "SELECT id FROM bookings WHERE technician_id = ? AND booking_date = ? AND booking_time = ?";
        $stmt_check_slot = $conn->prepare($sql_check_slot);
        $stmt_check_slot->bind_param("sss",  $technician_id, $date, $time);
        $stmt_check_slot->execute();
        if ($stmt_check_slot->get_result()->num_rows > 0) {
            $stmt_check_slot->close();
            throw new Exception('This specific time slot is already taken. Please select another time.');
        }
        $stmt_check_slot->close();

        // --- If checks pass, proceed with updates ---

        // Operation 1: Insert the new booking into the `bookings` table.
        $sql_insert = "INSERT INTO bookings (technician_id, booking_date, booking_time) VALUES (?, ?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("sss", $technician_id, $date, $time);
        $stmt_insert->execute();
        $stmt_insert->close();

        // Operation 2: Update the `technicians_details` table to set `isAvailable` to 0.
        $sql_update = "UPDATE technicians_details SET isAvailable = 0 WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("s", $technician_id);
        $stmt_update->execute();
        $stmt_update->close();

        // If both queries were successful, commit the transaction to save the changes.
        $conn->commit();
        $response = ['success' => true, 'message' => 'Booking successful! The technician is now marked as unavailable.'];

    } catch (Exception $e) {
        // If any operation fails, roll back all changes from this transaction.
        $conn->rollback();
        $response = ['success' => false, 'message' => $e->getMessage()];
    }
}

$conn->close();
echo json_encode($response);
