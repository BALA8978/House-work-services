<?php
// Enable error reporting for development (remove or comment out in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection parameters for MySQL server (not a specific database yet)
$host = 'localhost';
$user = 'root'; // Default XAMPP MySQL username
$pass = '';     // Default XAMPP MySQL password (blank)

// Define the database name
$db_name = 'homecraft_pro_db';
$table_name = 'technicians';

header('Content-Type: text/plain'); // Use plain text for setup output

// --- Step 1: Connect to MySQL server (without specifying a database initially) ---
$conn = new mysqli($host, $user, $pass);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}
echo "Connected to MySQL server successfully.\n";

// --- Step 2: Create the database if it does not exist ---
$sql_create_db = "CREATE DATABASE IF NOT EXISTS `$db_name`";
if ($conn->query($sql_create_db) === TRUE) {
    echo "Database '$db_name' created or already exists.\n";
} else {
    echo "Error creating database: " . $conn->error . "\n";
    $conn->close();
    exit;
}

// --- Step 3: Select the newly created/existing database ---
$conn->select_db($db_name);
echo "Selected database '$db_name'.\n";

// --- Step 4: Create the 'technicians' table if it does not exist ---
// The schema is based on the data structure expected by your JavaScript
$sql_create_table = "
CREATE TABLE IF NOT EXISTS `$table_name` (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isAvailable TINYINT(1) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    experience INT DEFAULT 0,
    services TEXT, -- Store comma-separated services
    price INT DEFAULT 0
);
";

if ($conn->query($sql_create_table) === TRUE) {
    echo "Table '$table_name' created or already exists.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
    $conn->close();
    exit;
}

// --- Step 5: Optional: Insert some dummy data if the table is empty ---
// This helps you test immediately. You can remove this block later.
$sql_check_empty = "SELECT COUNT(*) AS count FROM `$table_name`";
$result_check = $conn->query($sql_check_empty);
$row_count = $result_check->fetch_assoc()['count'];

if ($row_count == 0) {
    echo "Table is empty. Inserting dummy data...\n";
    $sql_insert_data = "
    INSERT INTO `$table_name` (id, name, isAvailable, rating, experience, services, price) VALUES
    ('TECH001', 'Alice Johnson', 1, 4.8, 7, 'Plumbing, AC Repair', 500),
    ('TECH002', 'Bob Williams', 0, 4.2, 3, 'Electrical, Smart Home Setup', 450),
    ('TECH003', 'Charlie Brown', 1, 3.9, 5, 'Lawn Mowing, Tree Trimming', 300),
    ('TECH004', 'Diana Prince', 1, 4.5, 10, 'Painting, Carpentry', 600),
    ('TECH005', 'Eve Adams', 0, 4.1, 2, 'Pest Control', 350),
    ('TECH006', 'Frank Miller', 1, 4.7, 8, 'Pool Maintenance, Pressure Washing', 550);
    ";

    if ($conn->multi_query($sql_insert_data)) {
        echo "Dummy data inserted successfully.\n";
        // To clear results from multi_query for subsequent operations
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->more_results() && $conn->next_result());
    } else {
        echo "Error inserting dummy data: " . $conn->error . "\n";
    }
} else {
    echo "Table '$table_name' already contains data. Skipping dummy data insertion.\n";
}


echo "\nDatabase and table setup complete.\n";

$conn->close();
?>