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
    full_name VARCHAR(100) NOT NULL, -- Added from apply.php
    gender VARCHAR(10) NOT NULL,     -- Added from apply.php
    phone_number VARCHAR(20),        -- Renamed from 'phone' for consistency with apply.php
    area VARCHAR(255) NOT NULL,      -- Added from apply.php
    skills TEXT,
    documents_path VARCHAR(255) NOT NULL, -- Renamed from 'certificates' and made NOT NULL
    status VARCHAR(50) DEFAULT 'pending', -- Added for application status
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

echo "\n--- DATABASE SETUP COMPLETE ---";
$conn->close();
?>
