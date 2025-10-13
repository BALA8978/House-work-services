<?php
require '../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$payoutItems = $data['payouts'] ?? [];

if (empty($payoutItems)) {
    $response['message'] = 'No items selected for payout.';
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {
    // Group items by technician
    $techPayouts = [];
    foreach ($payoutItems as $item) {
        $techPayouts[$item['technician_name']]['items'][] = $item['history_id'];
        $techPayouts[$item['technician_name']]['total'] = ($techPayouts[$item['technician_name']]['total'] ?? 0) + $item['amount'];
    }

    $payoutStmt = $conn->prepare("INSERT INTO payouts (technician_id, amount, transaction_reference) SELECT id, ?, ? FROM technicians WHERE name = ?");
    $historyStmt = $conn->prepare("UPDATE job_history SET payout_status = 'Paid' WHERE history_id = ?");

    foreach ($techPayouts as $techName => $payoutData) {
        $totalAmount = $payoutData['total'];
        $ref = 'PAYOUT-' . date('Ymd') . '-' . uniqid();
        $payoutStmt->bind_param("dss", $totalAmount, $ref, $techName);
        $payoutStmt->execute();

        foreach ($payoutData['items'] as $historyId) {
            $historyStmt->bind_param("i", $historyId);
            $historyStmt->execute();
        }
    }

    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Payouts processed successfully!';

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'Error processing payouts: ' . $e->getMessage();
}

echo json_encode($response);
?>