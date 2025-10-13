<?php
require '../../config/db_connect.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

try {
    // Summary data
    $summary_sql = "SELECT
        (SELECT SUM(amount) FROM payments WHERE status = 'Paid') as total_revenue,
        (SELECT SUM(amount) FROM payouts) as total_payouts";
    $summary_result = $conn->query($summary_sql)->fetch_assoc();
    $summary_result['gross_profit'] = $summary_result['total_revenue'] - $summary_result['total_payouts'];

    // Monthly breakdown data
    $monthly_sql = "
        SELECT 
            DATE_FORMAT(p.payment_date, '%Y-%m') AS month,
            SUM(p.amount) AS revenue,
            (SELECT SUM(po.amount) FROM payouts po WHERE DATE_FORMAT(po.payout_date, '%Y-%m') = DATE_FORMAT(p.payment_date, '%Y-%m')) AS payouts
        FROM payments p
        WHERE p.status = 'Paid'
        GROUP BY month
        ORDER BY month DESC";
    $monthly_result = $conn->query($monthly_sql)->fetch_all(MYSQLI_ASSOC);

    $response['success'] = true;
    $response['data'] = [
        'summary' => $summary_result,
        'monthly_breakdown' => $monthly_result
    ];

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>