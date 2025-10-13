<?php
// File: /Technician/jobs/invoice.php
require '../config/db_connect.php';

// --- Security & Validation ---
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'technician') {
    die("Access Denied. Please log in as a technician.");
}
if (!isset($_GET['booking_id'])) {
    die("Error: No Booking ID provided.");
}

$booking_id = (int)$_GET['booking_id'];
$technician_user_id = $_SESSION['user_id'];

// --- Data Fetching ---
try {
    $sql = "SELECT
                b.booking_date, b.booking_time, b.work_description,
                u.full_name AS customer_name,
                cp.address AS customer_address, cp.city AS customer_city, cp.pincode AS customer_pincode,
                t.name AS technician_name,
                p.amount, p.status AS payment_status,
                jh.completion_status, jh.technician_notes, jh.work_photos_path, jh.materials_cost, jh.hours_spent
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN technicians t ON b.technician_id = t.id
            LEFT JOIN customer_profiles cp ON u.id = cp.user_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            LEFT JOIN job_history jh ON b.booking_id = jh.booking_id
            WHERE b.booking_id = ? AND t.user_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $booking_id, $technician_user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        die("Invoice not found or you do not have permission to view it.");
    }
    $data = $result->fetch_assoc();

    // --- Calculations ---
    $service_fee = $data['amount'];
    $materials_cost = $data['materials_cost'] ?? 0.00;
    $subtotal = $service_fee + $materials_cost;
    $tax_rate = 0.18; // Assuming 18% GST
    $tax_amount = $subtotal * $tax_rate;
    $total_amount = $subtotal + $tax_amount;
    $work_photos = $data['work_photos_path'] ? explode(',', $data['work_photos_path']) : [];

} catch (Exception $e) {
    die("Database Error: " . $e->getMessage());
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice #<?php echo htmlspecialchars($booking_id); ?></title>
    <link rel="stylesheet" href="invoice.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="invoice-box">
        <header>
            <div class="company-details">
                <img src="../../Customers/login/Photos/logo.png" alt="Company Logo" class="logo">
                <div>
                    <strong>HomeCraft Pro</strong><br>
                    123 Service Lane<br>
                    Vijayawada, AP 520001
                </div>
            </div>
            <h1>Invoice</h1>
        </header>

        <section class="customer-details">
            <div>
                <strong>Billed To:</strong><br>
                <?php echo htmlspecialchars($data['customer_name']); ?><br>
                <?php echo htmlspecialchars($data['customer_address'] . ', ' . $data['customer_city'] . ', ' . $data['customer_pincode']); ?>
            </div>
            <div>
                <strong>Invoice Number:</strong> INV-<?php echo htmlspecialchars($booking_id); ?><br>
                <strong>Date of Issue:</strong> <?php echo htmlspecialchars($data['booking_date']); ?><br>
                <strong>Payment Status:</strong> <span class="status <?php echo strtolower(htmlspecialchars($data['payment_status'])); ?>"><?php echo htmlspecialchars($data['payment_status']); ?></span>
            </div>
        </section>

        <section class="items-table">
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Details</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Service Fee</strong></td>
                        <td><?php echo htmlspecialchars($data['work_description']); ?></td>
                        <td>₹<?php echo number_format($service_fee, 2); ?></td>
                    </tr>
                    <?php if ($materials_cost > 0): ?>
                    <tr>
                        <td><strong>Materials Used</strong></td>
                        <td>As per job completion notes</td>
                        <td>₹<?php echo number_format($materials_cost, 2); ?></td>
                    </tr>
                    <?php endif; ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="text-right">Subtotal</td>
                        <td>₹<?php echo number_format($subtotal, 2); ?></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-right">GST (18%)</td>
                        <td>₹<?php echo number_format($tax_amount, 2); ?></td>
                    </tr>
                    <tr class="total">
                        <td colspan="2" class="text-right">Total Amount</td>
                        <td>₹<?php echo number_format($total_amount, 2); ?></td>
                    </tr>
                </tfoot>
            </table>
        </section>

        <section class="notes">
            <strong>Technician Notes:</strong>
            <p><?php echo nl2br(htmlspecialchars($data['technician_notes'])); ?></p>
        </section>

        <?php if (!empty($work_photos)): ?>
        <section class="photos">
            <h3>Photos of Completed Work</h3>
            <div class="photo-gallery">
                <?php foreach ($work_photos as $photo_path): ?>
                    <a href="../../<?php echo htmlspecialchars(trim($photo_path)); ?>" target="_blank">
                        <img src="../../<?php echo htmlspecialchars(trim($photo_path)); ?>" alt="Work Photo">
                    </a>
                <?php endforeach; ?>
            </div>
        </section>
        <?php endif; ?>

        <footer>
            <p>Thank you for choosing HomeCraft Pro!</p>
        </footer>
    </div>
</body>
</html>