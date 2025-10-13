<?php
// --- Master Database Setup Script ---
// This script creates the entire database schema and populates it with comprehensive static data.
// Run this file once to initialize your application's database.

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

// --- Database Connection Details ---
$servername = "localhost";
$username = "root";
$password = ""; // This is an empty password
$dbname = "homecraft_pro_db";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("Connection to MySQL server failed: " . $conn->connect_error);
}
echo "1. Connected to MySQL server successfully.\n";

// 2. Create Database if it doesn't exist
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql_create_db) === TRUE) {
    echo "2. Database '$dbname' created or already exists.\n";
} else {
    die("Error creating database: " . $conn->error);
}

// 3. Select the Database
$conn->select_db($dbname);
echo "3. Selected database '$dbname'.\n";

// --- Drop existing tables in the correct order to avoid foreign key issues ---
$conn->query("SET FOREIGN_KEY_CHECKS = 0;");
// THIS IS THE CORRECTED LINE
$tables_to_drop = [
    'reviews', 'warranty_claims', 'support_tickets', 'payments',
    'recurring_bookings', 'recurring_services', 'open_jobs',
    'job_materials', 'job_history', 'bookings', 'technician_profiles', 'technicians',
    'customer_profiles', 'users', 'item_requests', 'inventory_stock',
    'inventory_items', 'office_locations', 'payouts', 'services' // Added 'services' here
];
foreach ($tables_to_drop as $table) {
    $conn->query("DROP TABLE IF EXISTS `$table`;");
}
$conn->query("SET FOREIGN_KEY_CHECKS = 1;");
echo "3.5. All existing tables dropped successfully.\n";

// --- 4. Schema Creation ---
echo "4. Starting table creation...\n";

try {
    // users: The central table for all logins.
    $conn->query("
    CREATE TABLE `users` (
      `id` INT(6) UNSIGNED NOT NULL AUTO_INCREMENT,
      `full_name` VARCHAR(100) NOT NULL,
      `email` VARCHAR(100) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `role` ENUM('customer', 'technician', 'admin') NOT NULL,
      `registration_date` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // customer_profiles: Stores additional details for customers.
    $conn->query("
    CREATE TABLE `customer_profiles` (
      `profile_id` INT(11) NOT NULL AUTO_INCREMENT,
      `user_id` INT(6) UNSIGNED NOT NULL UNIQUE,
      `gender` VARCHAR(10),
      `phone` VARCHAR(20),
      `address` TEXT,
      `city` VARCHAR(100),
      `state` VARCHAR(100),
      `pincode` VARCHAR(10),
      PRIMARY KEY (`profile_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // technicians: The main operational table for active, approved technicians.

    $conn->query("
    CREATE TABLE `technicians` (
      `id` VARCHAR(50) NOT NULL,
      `user_id` INT(6) UNSIGNED NOT NULL UNIQUE,
      `name` VARCHAR(255) NOT NULL,
      `isAvailable` TINYINT(1) DEFAULT 1,
      `rating` DECIMAL(3,1) DEFAULT 4.0,
      `experience` INT(11) DEFAULT 0,
      `services` TEXT,
      `price` INT(11) DEFAULT 0,
      `availability_type` ENUM('Day', 'Night') DEFAULT 'Day',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // technician_profiles: Staging table for technician applications.
    $conn->query("
    CREATE TABLE `technician_profiles` (
      `profile_id` INT(11) NOT NULL AUTO_INCREMENT,
      `user_id` INT(6) UNSIGNED NOT NULL UNIQUE,
      `full_name` VARCHAR(100) NOT NULL,
      `gender` VARCHAR(10) NOT NULL,
      `phone_number` VARCHAR(20),
      `area` VARCHAR(255) NOT NULL,
      `skills` TEXT,
      `documents_path` VARCHAR(255),
      `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      PRIMARY KEY (`profile_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // bookings: Core table for all service appointments.
    $conn->query("
    CREATE TABLE `bookings` (
      `booking_id` INT(11) NOT NULL AUTO_INCREMENT,
      `user_id` INT(6) UNSIGNED NOT NULL,
      `technician_id` VARCHAR(50) NULL,
      `booking_date` DATE NOT NULL,
      `booking_time` VARCHAR(20) NOT NULL,
      `work_description` TEXT,
      `status` VARCHAR(50) DEFAULT 'Confirmed',
      `cancellation_reason` TEXT,
      `work_status` ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Pending',
      `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`booking_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // job_history: A permanent log of completed jobs, used for invoices and payment tracking.
    $conn->query("
    CREATE TABLE `job_history` (
        `history_id` INT(11) NOT NULL AUTO_INCREMENT,
        `booking_id` INT(11) NOT NULL UNIQUE,
        `technician_id` VARCHAR(50) NOT NULL,
        `customer_user_id` INT(6) UNSIGNED NOT NULL,
        `completion_status` ENUM('Success', 'Failed') NOT NULL,
        `technician_notes` TEXT,
        `work_photos_path` TEXT NULL,
        `materials_cost` DECIMAL(10,2) DEFAULT 0.00,
        `hours_spent` DECIMAL(5,2) DEFAULT 0.00,
        `payout_status` ENUM('Pending','Ready','Paid') NOT NULL DEFAULT 'Pending',
        `completed_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`history_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // payments: Tracks financial transactions for each booking.
    $conn->query("
    CREATE TABLE `payments` (
        `payment_id` INT(11) NOT NULL AUTO_INCREMENT,
        `booking_id` INT(11) NOT NULL,
        `customer_id` INT(6) UNSIGNED NOT NULL,
        `technician_id` VARCHAR(50) NOT NULL,
        `amount` DECIMAL(10, 2) NOT NULL,
        `status` ENUM('Pending', 'Paid', 'Refunding', 'Refunded') NOT NULL DEFAULT 'Pending',
        `payment_date` TIMESTAMP NULL,
        `transaction_id` VARCHAR(255),
        PRIMARY KEY (`payment_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // payouts: Logs payments made by the admin to technicians.
    $conn->query("
    CREATE TABLE `payouts` (
      `payout_id` INT(11) NOT NULL AUTO_INCREMENT,
      `technician_id` VARCHAR(50) NOT NULL,
      `amount` DECIMAL(10,2) NOT NULL,
      `payout_date` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      `payment_method` VARCHAR(100) DEFAULT 'Bank Transfer',
      `transaction_reference` VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (`payout_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $conn->query("
    CREATE TABLE `services` (
  `service_id` INT(11) NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(255) NOT NULL UNIQUE,
  `base_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Other tables...
    $conn->query("CREATE TABLE `reviews` (`review_id` INT(11) NOT NULL AUTO_INCREMENT, `booking_id` INT(11) NOT NULL UNIQUE, `user_id` INT(6) UNSIGNED NOT NULL, `technician_id` VARCHAR(50) NOT NULL, `rating` INT(1) NOT NULL, `comment` TEXT, `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`review_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `warranty_claims` (`claim_id` INT(11) NOT NULL AUTO_INCREMENT, `booking_id` INT(11) NOT NULL UNIQUE, `user_id` INT(6) UNSIGNED NOT NULL, `subject` VARCHAR(255) NOT NULL, `description` TEXT NOT NULL, `status` ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending', `submitted_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`claim_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `recurring_services` (`service_id` INT(11) NOT NULL AUTO_INCREMENT, `name` VARCHAR(255) NOT NULL, `description` TEXT, `frequency` ENUM('Weekly', 'Monthly') NOT NULL, `price` DECIMAL(10, 2) NOT NULL, PRIMARY KEY (`service_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `recurring_bookings` (`recurring_booking_id` INT(11) NOT NULL AUTO_INCREMENT, `user_id` INT(6) UNSIGNED NOT NULL, `service_id` INT(11) NOT NULL, `start_date` DATE NOT NULL, `next_service_date` DATE NOT NULL, `status` ENUM('Active', 'Paused', 'Cancelled') NOT NULL DEFAULT 'Active', `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`recurring_booking_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `support_tickets` (`ticket_id` INT(11) NOT NULL AUTO_INCREMENT, `user_id` INT(6) UNSIGNED NOT NULL, `booking_id` INT(11) NULL, `subject` VARCHAR(255) NOT NULL, `description` TEXT NOT NULL, `status` ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open', `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`ticket_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `open_jobs` (`open_job_id` INT(11) NOT NULL AUTO_INCREMENT, `booking_id` INT(11) NOT NULL UNIQUE, `original_technician_id` VARCHAR(50) NOT NULL, `reason_for_rejection` TEXT, `is_customer_approved` TINYINT(1) NOT NULL DEFAULT 0, `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`open_job_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `inventory_items` (`item_id` INT(11) NOT NULL AUTO_INCREMENT, `item_name` VARCHAR(255) NOT NULL UNIQUE, `item_description` TEXT, `item_type` ENUM('Tool','Material','Kit') NOT NULL, `stock_unit` VARCHAR(50) NOT NULL, `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`item_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `job_materials` (`job_material_id` INT(11) NOT NULL AUTO_INCREMENT, `booking_id` INT(11) NOT NULL, `item_id` INT(11) NOT NULL, `quantity_used` INT(11) NOT NULL, `status` ENUM('Requested','Collected','Used') NOT NULL DEFAULT 'Requested', PRIMARY KEY (`job_material_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("CREATE TABLE `item_requests` (`request_id` INT(11) NOT NULL AUTO_INCREMENT, `technician_user_id` INT(6) UNSIGNED NOT NULL, `item_name` VARCHAR(255) NOT NULL, `reason` TEXT NOT NULL, `status` ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending', `requested_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`request_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $conn->query("
    CREATE TABLE `inventory_stock` (
  `stock_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL COMMENT 'Can be positive (stock in) or negative (stock out)',
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`stock_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");


    echo "4.1. All tables created successfully.\n";
} catch (Exception $e) {
    die("Error during table creation: " . $e->getMessage() . "\n");
}


// --- 5. Foreign Key Constraints ---
echo "5. Applying foreign key constraints...\n";
$constraints = [
    "ALTER TABLE `customer_profiles` ADD CONSTRAINT `fk_customer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `technicians` ADD CONSTRAINT `fk_technician_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `technician_profiles` ADD CONSTRAINT `fk_technician_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `bookings` ADD CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `bookings` ADD CONSTRAINT `fk_booking_technician` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE SET NULL",
    "ALTER TABLE `reviews` ADD CONSTRAINT `fk_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `reviews` ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `warranty_claims` ADD CONSTRAINT `fk_warranty_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `recurring_bookings` ADD CONSTRAINT `fk_recurring_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `recurring_bookings` ADD CONSTRAINT `fk_recurring_service` FOREIGN KEY (`service_id`) REFERENCES `recurring_services` (`service_id`) ON DELETE CASCADE",
    "ALTER TABLE `support_tickets` ADD CONSTRAINT `fk_support_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `open_jobs` ADD CONSTRAINT `fk_open_job_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `job_history` ADD CONSTRAINT `fk_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `job_materials` ADD CONSTRAINT `fk_job_material_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE",
    "ALTER TABLE `job_materials` ADD CONSTRAINT `fk_job_material_item` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`item_id`) ON DELETE CASCADE",
    "ALTER TABLE `item_requests` ADD CONSTRAINT `fk_item_request_technician` FOREIGN KEY (`technician_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE",
    "ALTER TABLE `payouts` ADD CONSTRAINT `fk_payout_technician` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE"
];
foreach ($constraints as $constraint) { if (!$conn->query($constraint)) { echo "Error applying constraint: " . $conn->error . "\n"; } }
echo "5. All constraints applied successfully.\n";

// --- 6. Sample Data Insertion ---
echo "6. Inserting comprehensive sample data...\n";
$conn->begin_transaction();
try {
    // Passwords
    $customer_pass = password_hash('pass123', PASSWORD_DEFAULT);
    $tech_pass = password_hash('techpass', PASSWORD_DEFAULT);
    $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);

    // Users
    $conn->query("INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`) VALUES
        (1, 'Diana Lee', 'diana.l@example.com', '$customer_pass', 'customer'),
        (2, 'Ella Perez', 'ella.p@example.com', '$customer_pass', 'customer'),
        (3, 'Frank Moore', 'frank.m@example.com', '$customer_pass', 'customer'),
        (10, 'Admin User', 'admin@homecraft.com', '$admin_pass', 'admin'),
        (11, 'Alice Johnson', 'alice.j@example.com', '$tech_pass', 'technician'),
        (12, 'Bob Williams', 'bob.w@example.com', '$tech_pass', 'technician'),
        (13, 'Charlie Smith', 'charlie.s@example.com', '$tech_pass', 'technician'),
        (14, 'Grace Liu', 'grace.l@example.com', '$tech_pass', 'technician'),
        (15, 'Ken Adams', 'ken.a@example.com', '$tech_pass', 'technician')");

    // Customer Profiles
    $conn->query("INSERT INTO `customer_profiles` (`user_id`, `gender`, `phone`, `address`, `city`, `state`, `pincode`) VALUES
        (1, 'Female', '9876543210', '12 Main Road, Apt 101', 'Pune', 'Maharashtra', '411001'),
        (2, 'Female', '9876543211', '45 Park Avenue, Block B', 'Mumbai', 'Maharashtra', '400020'),
        (3, 'Male', '9876543212', '78 Hill Street', 'Nagpur', 'Maharashtra', '440001')");
    $conn->query("
    INSERT INTO `services` (`service_name`, `base_price`) VALUES
('Plumbing', 500.00),
('AC Repair', 750.00),
('Electrical', 450.00),
('Painting', 1500.00),
('Carpentry', 600.00),
('House Cleaning', 800.00);");
    // Technician Profiles (for onboarding)
    $conn->query("INSERT INTO `technician_profiles` (`user_id`, `full_name`, `gender`, `phone_number`, `area`, `skills`, `documents_path`, `status`) VALUES
        (11, 'Alice Johnson', 'Female', '8001004001', 'Koregaon Park, Pune', 'Plumbing, AC Repair', 'uploads/sample_doc.pdf', 'approved'),
        (12, 'Bob Williams', 'Male', '8001004002', 'Bandra, Mumbai', 'Electrical, Wiring', 'uploads/sample_doc.pdf', 'approved'),
        (13, 'Charlie Smith', 'Male', '8001004003', 'Powai, Mumbai', 'Painting, Carpentry', 'uploads/sample_doc.pdf', 'pending'),
        (14, 'Grace Liu', 'Female', '8001004004', 'Viman Nagar, Pune', 'House Cleaning, Sanitization', 'uploads/sample_doc.pdf', 'approved'),
        (15, 'Ken Adams', 'Male', '8001004005', 'Andheri, Mumbai', 'Plumbing, Water Heaters', 'uploads/sample_doc.pdf', 'rejected')");
    
    // Technicians (active ones)
    $conn->query("INSERT INTO `technicians` (`id`, `user_id`, `name`, `services`, `price`, `rating`, `experience`) VALUES
        ('TECH001', 11, 'Alice Johnson', 'Plumbing, AC Repair', 500, 4.8, 5),
        ('TECH002', 12, 'Bob Williams', 'Electrical', 450, 4.5, 8),
        ('TECH004', 14, 'Grace Liu', 'Cleaning', 400, 4.9, 3)");

    // Bookings (various scenarios)
    $conn->query("INSERT INTO `bookings` (`booking_id`, `user_id`, `technician_id`, `booking_date`, `booking_time`, `work_description`, `status`, `work_status`) VALUES
        (1, 1, 'TECH001', '2025-09-10', '09:00-11:00', 'Fix leaky kitchen faucet.', 'Accepted', 'Completed'),
        (2, 2, 'TECH002', '2025-09-12', '10:00-12:00', 'Install new ceiling fan in living room.', 'Accepted', 'Completed'),
        (3, 1, 'TECH004', '2025-09-18', '14:00-16:00', 'Full 2BHK deep cleaning service.', 'Accepted', 'Pending'),
        (4, 3, 'TECH001', '2025-09-20', '11:00-13:00', 'AC unit is not cooling properly.', 'Confirmed', 'Pending'),
        (5, 2, 'TECH002', '2025-09-22', '15:00-17:00', 'Fix flickering lights in the hallway.', 'Cancelled', 'Pending'),
        (6, 3, 'TECH001', '2025-08-25', '09:00-11:00', 'Leaky pipe under the bathroom sink', 'Accepted', 'Completed')");
    
    // Payments
    $conn->query("INSERT INTO `payments` (`booking_id`, `customer_id`, `technician_id`, `amount`, `status`) VALUES
        (1, 1, 'TECH001', 500.00, 'Paid'),
        (2, 2, 'TECH002', 450.00, 'Paid'),
        (3, 1, 'TECH004', 400.00, 'Pending'),
        (4, 3, 'TECH001', 500.00, 'Pending'),
        (5, 2, 'TECH002', 450.00, 'Refunding'),
        (6, 3, 'TECH001', 500.00, 'Paid')");

    // Job History for completed jobs
    $conn->query("INSERT INTO `job_history` (`booking_id`, `technician_id`, `customer_user_id`, `completion_status`, `technician_notes`, `materials_cost`, `hours_spent`, `payout_status`) VALUES
        (1, 'TECH001', 1, 'Success', 'Replaced the faulty washer in the kitchen faucet. Tested for leaks, all clear.', 50.00, 1.5, 'Ready'),
        (2, 'TECH002', 2, 'Success', 'Ceiling fan installed successfully. Balanced the blades and tested all speed settings.', 0.00, 2.0, 'Ready'),
        (6, 'TECH001', 3, 'Success', 'Fixed the pipe leak by replacing a section of the PVC pipe. The area is now dry.', 150.00, 1.0, 'Paid')");

    // Payouts for already paid-out jobs
    $conn->query("INSERT INTO `payouts` (`technician_id`, `amount`, `payout_date`, `transaction_reference`) VALUES
        ('TECH001', 400.00, '2025-09-01 10:00:00', 'PAYOUT-SEP1-TECH001')");

    // Reviews
    $conn->query("INSERT INTO `reviews` (`booking_id`, `user_id`, `technician_id`, `rating`, `comment`) VALUES
        (1, 1, 'TECH001', 5, 'Alice was fantastic! Very professional and fixed the problem quickly.'),
        (2, 2, 'TECH002', 4, 'Good work on the installation. Arrived a bit later than scheduled but finished the job well.')");

    // Warranty Claims
    $conn->query("INSERT INTO `warranty_claims` (`booking_id`, `user_id`, `subject`, `description`, `status`) VALUES
        (1, 1, 'Faucet is dripping again', 'The same faucet that was repaired last week has started to drip slowly.', 'Pending')");
        
    // Support Tickets
    $conn->query("INSERT INTO `support_tickets` (`user_id`, `booking_id`, `subject`, `description`, `status`) VALUES
        (2, 3, 'Question about cleaning service', 'Do I need to provide the cleaning supplies or does the technician bring them?', 'Open')");

    // Inventory Items
    $conn->query("INSERT INTO `inventory_items` (`item_name`, `item_type`, `stock_unit`) VALUES
        ('1/2 inch PVC Pipe (10ft)', 'Material', 'units'),
        ('Pipe Wrench', 'Tool', 'units'),
        ('AC Gas R32', 'Material', 'kgs'),
        ('Standard Cleaning Kit', 'Kit', 'kits')");

    $conn->commit();
    echo "6.1. Sample data inserted successfully.\n";
} catch (Exception $e) {
    $conn->rollback();
    die("Transaction failed: " . $e->getMessage());
}

$conn->close();
echo "\n--- DATABASE SETUP SCRIPT COMPLETE ---\n";
?>