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

// 4. Create 'users' Table
$sql_users_table = "
CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql_users_table) === TRUE) {
    echo "4. Table 'users' created or already exists.\n";
} else {
    die("Error creating 'users' table: " . $conn->error);
}

// 5. Create 'customer_profiles' Table
$sql_customer_profiles = "
CREATE TABLE IF NOT EXISTS customer_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
if ($conn->query($sql_customer_profiles) === TRUE) {
    echo "5. Table 'customer_profiles' created or already exists.\n";
} else {
    die("Error creating 'customer_profiles' table: " . $conn->error);
}


// 6. Create 'technicians' Table (for searching)
$sql_technicians_table = "
CREATE TABLE IF NOT EXISTS technicians (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    isAvailable TINYINT(1) DEFAULT 1,
    rating DECIMAL(3,1) DEFAULT 4.0,
    experience INT DEFAULT 0,
    services TEXT,
    price INT DEFAULT 0,
    availability_type ENUM('Day', 'Night') DEFAULT 'Day',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
if ($conn->query($sql_technicians_table) === TRUE) {
    echo "6. Table 'technicians' created or already exists.\n";
} else {
    die("Error creating 'technicians' table: " . $conn->error);
}

// 7. Create 'technician_profiles' Table (for detailed application/profile)
// MODIFIED: Updated to match the fields from the application form (apply.php)
$sql_technician_profiles = "
CREATE TABLE IF NOT EXISTS technician_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20),
    area VARCHAR(255) NOT NULL,
    skills TEXT,
    documents_path VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
if ($conn->query($sql_technician_profiles) === TRUE) {
    echo "7. Table 'technician_profiles' created or already exists.\n";
} else {
    die("Error creating 'technician_profiles' table: " . $conn->error);
}

// 8. Create 'bookings' Table
$sql_bookings_table = "
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    technician_id VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (technician_id, booking_date, booking_time)
)";
if ($conn->query($sql_bookings_table) === TRUE) {
    echo "8. Table 'bookings' created or already exists.\n";
} else {
    die("Error creating 'bookings' table: " . $conn->error);
}

// 9. Create 'technician_unavailable_periods' Table
$sql_unavailable_periods_table = "
CREATE TABLE IF NOT EXISTS technician_unavailable_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id VARCHAR(50) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason VARCHAR(255) DEFAULT 'Unavailable',
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
)";
if ($conn->query($sql_unavailable_periods_table) === TRUE) {
    echo "9. Table 'technician_unavailable_periods' created or already exists.\n";
} else {
    die("Error creating 'technician_unavailable_periods' table: " . $conn->error);
}

// 10. Create 'recurring_bookings' Table
$sql_recurring_bookings_table = "
CREATE TABLE IF NOT EXISTS recurring_bookings (
    recurring_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    technician_id VARCHAR(50) NOT NULL,
    service_description TEXT,
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    booking_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
);";
if ($conn->query($sql_recurring_bookings_table) === TRUE) {
    echo "10. Table 'recurring_bookings' created or already exists.\n";
} else {
    die("Error creating 'recurring_bookings' table: " . $conn->error);
}


// 11. Create 'recurring_services' Table
$sql_create_recurring_services_table = "
CREATE TABLE IF NOT EXISTS recurring_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency ENUM('Weekly', 'Monthly') NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
";

if ($conn->query($sql_create_recurring_services_table) === TRUE) {
    echo "11. Table 'recurring_services' created or already exists.\n";
} else {
    echo "Error creating table 'recurring_services': " . $conn->error . "\n";
}

// 12. Add 'pending_technicians' table
$sql_pending_technicians = "
CREATE TABLE IF NOT EXISTS pending_technicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  area VARCHAR(255) NOT NULL,
  skills TEXT NOT NULL,
  documents_path VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY user_id (user_id)
);";
if ($conn->query($sql_pending_technicians) === TRUE) {
    echo "12. Table 'pending_technicians' created or already exists.\n";
} else {
    die("Error creating table 'pending_technicians': " . $conn->error);
}


// Add `technician_profiles` data from the previous conversation.
$sql_insert_technician_profiles = "
INSERT INTO technician_profiles (user_id, full_name, gender, phone_number, area, skills, documents_path, status) VALUES
(1, 'Alice Johnson', 'female', '555-001-0001', 'Anytown', 'Plumbing, AC Repair', 'path/to/doc1.pdf', 'pending'),
(2, 'Bob Williams', 'male', '555-002-0002', 'Sometown', 'Electrical, Smart Home Setup', 'path/to/doc2.pdf', 'pending'),
(3, 'Charlie Brown', 'male', '555-003-0003', 'Ourville', 'Lawn Mowing, Tree Trimming', 'path/to/doc3.pdf', 'pending'),
(4, 'Diana Prince', 'female', '555-004-0004', 'Your City', 'Painting, Carpentry', 'path/to/doc4.pdf', 'pending'),
(5, 'Eve Adams', 'female', '555-005-0005', 'Their Town', 'Pest Control', 'path/to/doc5.pdf', 'pending'),
(6, 'Frank Miller', 'male', '555-006-0006', 'Another City', 'Pool Maintenance, Pressure Washing', 'path/to/doc6.pdf', 'pending')
ON DUPLICATE KEY UPDATE status=VALUES(status);
";

if ($conn->query($sql_insert_technician_profiles) === TRUE) {
    echo "13. Data inserted into 'technician_profiles' table.\n";
} else {
    echo "Error inserting into 'technician_profiles': " . $conn->error . "\n";
}

// Add the trigger code.
$sql_trigger = "
DELIMITER //

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
//

DELIMITER ;
";

// Execute the trigger creation. We'll ignore errors if the trigger already exists.
$conn->multi_query($sql_trigger);
echo "14. Trigger `after_technician_profile_insert` created.\n";

$conn->close();
?>
