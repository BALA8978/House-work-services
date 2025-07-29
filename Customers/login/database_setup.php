<?php


// --- Step 1: Database Connection Variables ---
// Replace with your actual database server credentials
$servername = "localhost"; // Or your server IP/domain
$username = "root";      // Your MySQL username
$password = "";          // Your MySQL password
$dbname = "homecraft_pro_db"; // The name for your new database

// --- Step 2: Create a connection to the MySQL server ---
// This connection is to the server itself, not a specific database yet.
$conn = new mysqli($servername, $username, $password);

// Check the connection for errors
if ($conn->connect_error) {
    // If there's an error, stop the script and display the error message.
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected to MySQL server successfully.<br>";

// --- Step 3: Create the Database if it doesn't exist ---
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql_create_db) === TRUE) {
    echo "Database '$dbname' created successfully or already exists.<br>";
} else {
    // If there's an error creating the database, stop the script.
    die("Error creating database: " . $conn->error);
}

// --- Step 4: Select the new database for use ---
$conn->select_db($dbname);

// --- Step 5: Define the SQL query to create the 'users' table ---
// This table will store the information from your registration form.
$sql_create_table = "
CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Increased length for hashed passwords
    role VARCHAR(20) NOT NULL, -- 'customer' or 'technician'
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

// --- Step 6: Execute the query to create the table ---
if ($conn->query($sql_create_table) === TRUE) {
    echo "Table 'users' created successfully or already exists.<br>";
} else {
    // If there's an error creating the table, show the error.
    echo "Error creating table: " . $conn->error . "<br>";
}

// --- Step 7: Close the database connection ---
$conn->close();

echo "<hr><strong>Database setup is complete!</strong> You can now proceed with your 'register.php' and 'login.php' files.";

?>
