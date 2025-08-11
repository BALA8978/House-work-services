<?php
// --- Master Database Setup Script ---
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

// --- Database Connection Details ---
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "homecraft_pro_db";

// 1. Connect to MySQL Server
$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("Connection to MySQL server failed: " . $conn->connect_error);
}
echo "1. Connected to MySQL server successfully.\n";

// 2. Create Database
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql_create_db) === TRUE) {
    echo "2. Database '$dbname' created or already exists.\n";
} else {
    die("Error creating database: " . $conn->error);
}

// 3. Select the Database
$conn->select_db($dbname);
echo "3. Selected database '$dbname'.\n";

// --- Drop tables to ensure a clean start with the correct schema ---
$conn->query("SET FOREIGN_KEY_CHECKS = 0;");
$conn->query("DROP TABLE IF EXISTS bookings, customer_profiles, pending_technicians, recurring_bookings, recurring_services, technicians, technician_profiles, technician_unavailable_periods, users, payments;");
$conn->query("SET FOREIGN_KEY_CHECKS = 1;");
echo "3.5. Existing tables dropped to ensure a clean setup.\n";


// 4. Create 'users' Table
$sql_users_table = "
CREATE TABLE `users` (
  `id` INT(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `registration_date` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_users_table) === TRUE) {
    echo "4. Table 'users' created successfully.\n";
} else {
    die("Error creating 'users' table: " . $conn->error);
}

// 5. Create 'customer_profiles' Table
$sql_customer_profiles = "
CREATE TABLE `customer_profiles` (
  `profile_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(6) UNSIGNED NOT NULL,
  `gender` VARCHAR(10) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `uk_customer_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_customer_profiles) === TRUE) {
    echo "5. Table 'customer_profiles' created successfully.\n";
} else {
    die("Error creating 'customer_profiles' table: " . $conn->error);
}


// 6. Create 'technicians' Table (for searching)
$sql_technicians_table = "
CREATE TABLE `technicians` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` INT(6) UNSIGNED NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `isAvailable` TINYINT(1) DEFAULT 1,
  `rating` DECIMAL(3,1) DEFAULT 4.0,
  `experience` INT(11) DEFAULT 0,
  `services` TEXT DEFAULT NULL,
  `price` INT(11) DEFAULT 0,
  `availability_type` ENUM('Day', 'Night') DEFAULT 'Day',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_technician_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_technicians_table) === TRUE) {
    echo "6. Table 'technicians' created successfully.\n";
} else {
    die("Error creating 'technicians' table: " . $conn->error);
}

// 7. Create 'technician_profiles' Table (for detailed application/profile)
$sql_technician_profiles = "
CREATE TABLE `technician_profiles` (
  `profile_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(6) UNSIGNED NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `gender` VARCHAR(10) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `area` VARCHAR(255) NOT NULL,
  `skills` TEXT DEFAULT NULL,
  `documents_path` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `uk_technician_profile_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_technician_profiles) === TRUE) {
    echo "7. Table 'technician_profiles' created successfully.\n";
} else {
    die("Error creating 'technician_profiles' table: " . $conn->error);
}

// 8. Create 'bookings' Table
$sql_bookings_table = "
CREATE TABLE `bookings` (
  `booking_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(6) UNSIGNED NOT NULL,
  `technician_id` VARCHAR(50) NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_time` VARCHAR(20) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Confirmed',
  `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `unique_booking` (`technician_id`,`booking_date`,`booking_time`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_bookings_table) === TRUE) {
    echo "8. Table 'bookings' created successfully.\n";
} else {
    die("Error creating 'bookings' table: " . $conn->error);
}

// 9. Create 'technician_unavailable_periods' Table
$sql_unavailable_periods_table = "
CREATE TABLE `technician_unavailable_periods` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `technician_id` VARCHAR(50) NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `reason` VARCHAR(255) DEFAULT 'Unavailable',
  PRIMARY KEY (`id`),
  KEY `technician_id` (`technician_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_unavailable_periods_table) === TRUE) {
    echo "9. Table 'technician_unavailable_periods' created successfully.\n";
} else {
    die("Error creating 'technician_unavailable_periods' table: " . $conn->error);
}

// 10. Create 'recurring_bookings' Table
$sql_recurring_bookings_table = "
CREATE TABLE `recurring_bookings` (
  `recurring_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(6) UNSIGNED NOT NULL,
  `technician_id` VARCHAR(50) NOT NULL,
  `service_description` TEXT DEFAULT NULL,
  `frequency` VARCHAR(20) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `booking_time` TIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`recurring_id`),
  KEY `user_id` (`user_id`),
  KEY `technician_id` (`technician_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_recurring_bookings_table) === TRUE) {
    echo "10. Table 'recurring_bookings' created successfully.\n";
} else {
    die("Error creating 'recurring_bookings' table: " . $conn->error);
}


// 11. Create 'recurring_services' Table
$sql_create_recurring_services_table = "
CREATE TABLE `recurring_services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `frequency` ENUM('Weekly', 'Monthly') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_create_recurring_services_table) === TRUE) {
    echo "11. Table 'recurring_services' created successfully.\n";
} else {
    die("Error creating table 'recurring_services': " . $conn->error . "\n");
}

// 12. Add `pending_technicians` table
$sql_pending_technicians = "
CREATE TABLE `pending_technicians` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(6) UNSIGNED NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `gender` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `area` VARCHAR(255) NOT NULL,
  `skills` TEXT NOT NULL,
  `documents_path` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `submission_date` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pending_technician_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_pending_technicians) === TRUE) {
    echo "12. Table 'pending_technicians' created successfully.\n";
} else {
    die("Error creating table 'pending_technicians': " . $conn->error);
}

// 13. Create 'payments' Table
$sql_payments_table = "
CREATE TABLE `payments` (
  `payment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `booking_id` INT(11) NOT NULL,
  `customer_id` INT(6) UNSIGNED NOT NULL,
  `technician_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',
  `payment_date` TIMESTAMP NULL DEFAULT NULL,
  `transaction_id` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `customer_id` (`customer_id`),
  KEY `technician_id` (`technician_id`),
  KEY `booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";
if ($conn->query($sql_payments_table) === TRUE) {
    echo "13. Table 'payments' created successfully.\n";
} else {
    die("Error creating 'payments' table: " . $conn->error);
}


// 14. Add Foreign Key Constraints to all tables
echo "\n14. Adding Foreign Key Constraints...\n";
$sql_constraints = "
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE;

ALTER TABLE `customer_profiles`
  ADD CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `recurring_bookings`
  ADD CONSTRAINT `recurring_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recurring_bookings_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE;

ALTER TABLE `technicians`
  ADD CONSTRAINT `technicians_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `technician_profiles`
  ADD CONSTRAINT `technician_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `technician_unavailable_periods`
  ADD CONSTRAINT `technician_unavailable_periods_ibfk_1` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE;

ALTER TABLE `pending_technicians`
  ADD CONSTRAINT `pending_technicians_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;
";
if ($conn->multi_query($sql_constraints)) {
    do {
        // Clear all results from the multi_query statement
    } while ($conn->more_results() && $conn->next_result());
    echo "   - Foreign key constraints added successfully.\n";
} else {
    die("Error adding foreign key constraints: " . $conn->error);
}

// 15. Data Insertion - Use a transaction to ensure all inserts succeed or fail together.
$conn->begin_transaction();
try {
    echo "\n15. Inserting initial data for recurring services and technicians...\n";

    // Insert into the 'recurring_services' table
    $sql_insert_recurring_services = "
    INSERT INTO `recurring_services` (`id`, `name`, `description`, `frequency`, `price`) VALUES
    (1, 'Weekly Clean-Up', 'A thorough cleaning of your home every week.', 'Weekly', 50.00),
    (2, 'Monthly Deep Clean', 'A deep clean of your entire house, once a month.', 'Monthly', 150.00),
    (3, 'Weekly Garden Maintenance', 'Keep your garden looking its best with weekly visits.', 'Weekly', 40.00),
    (4, 'Monthly Pest Control', 'Preventative pest control services, monthly.', 'Monthly', 75.00)
    ON DUPLICATE KEY UPDATE name=VALUES(name);";
    if (!$conn->query($sql_insert_recurring_services)) {
        throw new Exception("Error inserting into 'recurring_services': " . $conn->error);
    }
    echo "   - Data inserted into 'recurring_services' table.\n";

    // Hashing the password
    $hashed_password = password_hash('1234', PASSWORD_DEFAULT);
     $hashed_password_admin = password_hash('admin', PASSWORD_DEFAULT);

    // Insert into the 'users' table
    $sql_insert_users = "
    INSERT INTO users (id, full_name, email, password, role) VALUES
    (1, 'Alice Johnson', 'alice.j@example.com', '$hashed_password', 'technician'),
    (2, 'Bob Williams', 'bob.w@example.com', '$hashed_password', 'technician'),
    (3, 'Charlie Brown', 'charlie.b@example.com', '$hashed_password', 'technician'),
    (4, 'Diana Prince', 'diana.p@example.com', '$hashed_password', 'technician'),
    (5, 'Eve Adams', 'eve.a@example.com', '$hashed_password', 'technician'),
    (6, 'Frank Miller', 'frank.m@example.com', '$hashed_password', 'technician'),
    (7, 'Admin User', 'admin@gmail.com', '$hashed_password_admin', 'admin')
    ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email);";

    if (!$conn->query($sql_insert_users)) {
        throw new Exception("Error inserting into 'users': " . $conn->error);
    }
    echo "   - Data inserted into 'users' table.\n";

    // Insert into the 'technician_profiles' table (the corrected table)
    $sql_insert_profiles = "
    INSERT INTO technician_profiles (user_id, full_name, gender, phone_number, area, skills, documents_path, status) VALUES
    (1, 'Alice Johnson', 'female', '555-001-0001', 'Anytown', 'Plumbing, AC Repair', 'path/to/doc1.pdf', 'approved'),
    (2, 'Bob Williams', 'male', '555-002-0002', 'Sometown', 'Electrical, Smart Home Setup', 'path/to/doc2.pdf', 'approved'),
    (3, 'Charlie Brown', 'male', '555-003-0003', 'Ourville', 'Lawn Mowing, Tree Trimming', 'path/to/doc3.pdf', 'approved'),
    (4, 'Diana Prince', 'female', '555-004-0004', 'Your City', 'Painting, Carpentry', 'path/to/doc4.pdf', 'approved'),
    (5, 'Eve Adams', 'female', '555-005-0005', 'Their Town', 'Pest Control', 'path/to/doc5.pdf', 'approved'),
    (6, 'Frank Miller', 'male', '555-006-0006', 'Another City', 'Pool Maintenance, Pressure Washing', 'path/to/doc6.pdf', 'approved')
    ON DUPLICATE KEY UPDATE status=VALUES(status);";

    if (!$conn->query($sql_insert_profiles)) {
        throw new Exception("Error inserting into 'technician_profiles': " . $conn->error);
    }
    echo "   - Data inserted into 'technician_profiles' table.\n";

    // Insert into the 'technicians' table
    $sql_insert_technicians = "
    INSERT INTO technicians (id, user_id, name, isAvailable, rating, experience, services, price, availability_type) VALUES
    ('TECH001', 1, 'Alice Johnson', 1, 4.8, 7, 'Plumbing, AC Repair', 500, 'Day'),
    ('TECH002', 2, 'Bob Williams', 0, 4.2, 3, 'Electrical, Smart Home Setup', 450, 'Day'),
    ('TECH003', 3, 'Charlie Brown', 1, 3.9, 5, 'Lawn Mowing, Tree Trimming', 300, 'Day'),
    ('TECH004', 4, 'Diana Prince', 1, 4.5, 10, 'Painting, Carpentry', 600, 'Day'),
    ('TECH005', 5, 'Eve Adams', 0, 4.1, 2, 'Pest Control', 350, 'Day'),
    ('TECH006', 6, 'Frank Miller', 1, 4.7, 8, 'Pool Maintenance, Pressure Washing', 550, 'Day')
    ON DUPLICATE KEY UPDATE name=VALUES(name), isAvailable=VALUES(isAvailable), rating=VALUES(rating);";

    if (!$conn->query($sql_insert_technicians)) {
        throw new Exception("Error inserting into 'technicians': " . $conn->error);
    }
    echo "   - Data inserted into 'technicians' table.\n";

    // Commit the transaction.
    $conn->commit();
    echo "\nAll data inserted successfully.\n";

} catch (Exception $e) {
    // Rollback the transaction on error.
    $conn->rollback();
    die("Transaction failed: " . $e->getMessage());
}

// 16. Add the trigger to auto-create technicians
$sql_technician_trigger = "
CREATE TRIGGER after_technician_profile_insert
AFTER INSERT ON technician_profiles
FOR EACH ROW
BEGIN
    INSERT INTO technicians (
        id,
        user_id,
        name,
        isAvailable,
        rating,
        experience,
        services,
        price,
        availability_type
    ) VALUES (
        CONCAT('TECH-', NEW.user_id),
        NEW.user_id,
        NEW.full_name,
        1,
        4.0,
        0,
        NEW.skills,
        0,
        'Day'
    );
END;
";

// Execute the trigger creation. We'll ignore errors if the trigger already exists.
$conn->query("DROP TRIGGER IF EXISTS after_technician_profile_insert;");
if($conn->query($sql_technician_trigger)) {
    echo "16. Trigger `after_technician_profile_insert` created.\n";
} else {
    echo "Error creating technician trigger: " . $conn->error . "\n";
}

// 17. Add the trigger to auto-create a payment record on booking
$sql_payment_trigger = "
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE tech_price INT;
    SELECT price INTO tech_price FROM technicians WHERE id = NEW.technician_id;
    INSERT INTO payments (booking_id, customer_id, technician_id, amount, status)
    VALUES (NEW.booking_id, NEW.user_id, NEW.technician_id, tech_price, 'Pending');
END;
";
$conn->query("DROP TRIGGER IF EXISTS after_booking_insert;");
if($conn->query($sql_payment_trigger)) {
    echo "17. Trigger `after_booking_insert` created.\n";
} else {
    echo "Error creating payment trigger: " . $conn->error . "\n";
}


$conn->close();
?>