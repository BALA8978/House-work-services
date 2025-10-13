<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'payment_id' => null];

// Get the raw POST data from the JavaScript fetch request
$data = json_decode(file_get_contents('php://input'), true);

// Security Check: Ensure user is logged in before allowing them to book
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'Error: You must be logged in to create a booking.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id'];
$technician_id = $data['technician_id'] ?? '';
$date = $data['date'] ?? '';
$time = $data['time'] ?? '';
$description = $data['description'] ?? '';

// Validate the incoming data
if (empty($technician_id) || empty($date) || empty($time)) {
    $response['message'] = 'Missing required booking information. Please try again.';
    echo json_encode($response);
    exit;
}

// Start a transaction
$conn->begin_transaction();

try {
    // Step 1: Get the price from the technicians table to ensure it's correct
    $price_stmt = $conn->prepare("SELECT price FROM technicians WHERE id = ?");
    $price_stmt->bind_param("s", $technician_id);
    $price_stmt->execute();
    $price_result = $price_stmt->get_result();
    
    if ($price_result->num_rows === 0) {
        throw new Exception("Technician not found. Booking cannot be created.");
    }
    
    $technician_data = $price_result->fetch_assoc();
    $amount = $technician_data['price'];
    $price_stmt->close();

    // Step 2: Insert the new booking into the 'bookings' table
    $booking_stmt = $conn->prepare(
        "INSERT INTO bookings (user_id, technician_id, booking_date, booking_time, work_description, status, work_status) 
         VALUES (?, ?, ?, ?, ?, 'Confirmed', 'Pending')"
    );
    $booking_stmt->bind_param("issss", $user_id, $technician_id, $date, $time, $description);
    
    if (!$booking_stmt->execute()) {
        // Check for a duplicate booking error (unique key on technician_id, date, time)
        if ($conn->errno == 1062) {
             throw new Exception("This time slot has just been taken. Please go back and select another.");
        } else {
            throw new Exception("Failed to create booking record: " . $booking_stmt->error);
        }
    }
    
    $booking_id = $conn->insert_id; // Get the ID of the booking we just created
    $booking_stmt->close();

    // Step 3: Insert the corresponding payment record into the 'payments' table
    $payment_stmt = $conn->prepare(
        "INSERT INTO payments (booking_id, customer_id, technician_id, amount, status) 
         VALUES (?, ?, ?, ?, 'Pending')"
    );
    $payment_stmt->bind_param("iisd", $booking_id, $user_id, $technician_id, $amount);
    
    if (!$payment_stmt->execute()) {
        throw new Exception("Failed to create the associated payment record: " . $payment_stmt->error);
    }

    $payment_id = $conn->insert_id; // Get the ID for the new payment record
    $payment_stmt->close();

    // If all database operations were successful, commit the changes
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Booking confirmed successfully!';
    $response['payment_id'] = $payment_id; // Send the new payment_id back to the frontend

} catch (Exception $e) {
    // If any step failed, roll back all changes to keep the database consistent
    $conn->rollback(); 
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>