<?php
require '../config/db_connect.php';
header('Content-Type: application/json');
$response = ['success' => false, 'data' => []];

if (!isset($_SESSION['user_id'])) { exit; }
$technician_user_id = $_SESSION['user_id'];

try {
    // Get technician ID
    $stmt = $conn->prepare("SELECT id FROM technicians WHERE user_id = ?");
    $stmt->bind_param("i", $technician_user_id);
    $stmt->execute();
    $tech_id = $stmt->get_result()->fetch_assoc()['id'];

    // Get summary data
    $summary_sql = "
        SELECT
        (SELECT SUM(amount) FROM payouts WHERE technician_id = ?) as total_earned,
        (SELECT amount FROM payouts WHERE technician_id = ? ORDER BY payout_date DESC LIMIT 1) as last_payout,
        (SELECT SUM(p.amount) FROM job_history jh JOIN payments p ON jh.booking_id = p.booking_id WHERE jh.technician_id = ? AND jh.payout_status = 'Ready') as pending_payout";
    $summary_stmt = $conn->prepare($summary_sql);
    $summary_stmt->bind_param("sss", $tech_id, $tech_id, $tech_id);
    $summary_stmt->execute();
    $summary_data = $summary_stmt->get_result()->fetch_assoc();

    // Get jobs awaiting payout
    $awaiting_sql = "SELECT b.booking_date, p.amount FROM job_history jh JOIN bookings b ON jh.booking_id=b.booking_id JOIN payments p ON jh.booking_id=p.booking_id WHERE jh.technician_id = ? AND jh.payout_status = 'Ready'";
    $awaiting_stmt = $conn->prepare($awaiting_sql);
    $awaiting_stmt->bind_param("s", $tech_id);
    $awaiting_stmt->execute();
    $awaiting_data = $awaiting_stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Get payout history
    $history_sql = "SELECT payout_date, amount, transaction_reference FROM payouts WHERE technician_id = ? ORDER BY payout_date DESC";
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->bind_param("s", $tech_id);
    $history_stmt->execute();
    $history_data = $history_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $response['success'] = true;
    $response['data'] = [
        'summary' => $summary_data,
        'awaiting_payout' => $awaiting_data,
        'payout_history' => $history_data
    ];

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>