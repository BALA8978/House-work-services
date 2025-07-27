<?php

/**
 * Database Connection and Interaction Example (Using PDO)
 *
 * This script demonstrates how to connect to a MySQL database using PHP's PDO
 * (PHP Data Objects) extension, and perform basic CRUD (Create, Read, Update, Delete)
 * operations securely using prepared statements.
 *
 * IMPORTANT:
 * 1. Replace the placeholder database credentials below with your actual details.
 * 2. Ensure you have a MySQL database running and a table named 'users' with
 * at least 'id', 'name', 'email', and 'password_hash' columns.
 * A sample SQL for creating the table is provided at the end of this file.
 * 3. Always hash passwords before storing them in the database.
 * 4. This is a simplified example for demonstration. In a real application,
 * you would separate concerns (e.g., database logic in a separate file,
 * HTML in template files, proper error logging, etc.).
 */

// --- Configuration: Database Credentials ---
// !!! IMPORTANT: Replace these with your actual database details !!!
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name'); // e.g., 'my_app_db'
define('DB_USER', 'your_username');    // e.g., 'root'
define('DB_PASS', 'your_password');     // e.g., 'mysecretpassword'

/**
 * Class Database
 * Handles the database connection using PDO.
 */
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn; // Stores the PDO connection object

    /**
     * Constructor for the Database class.
     * Initializes database credentials.
     *
     * @param string $host The database host.
     * @param string $db_name The name of the database.
     * @param string $username The database username.
     * @param string $password The database password.
     */
    public function __construct($host, $db_name, $username, $password) {
        $this->host = $host;
        $this->db_name = $db_name;
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Establishes and returns a PDO database connection.
     *
     * @return PDO|null The PDO connection object on success, or null on failure.
     */
    public function getConnection() {
        $this->conn = null; // Reset connection to ensure a new one is made

        try {
            // Data Source Name (DSN) for MySQL
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";

            // PDO options for error handling and fetching mode
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,       // Throw exceptions on errors
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,             // Fetch results as associative arrays
                PDO::ATTR_EMULATE_PREPARES   => false,                        // Disable emulation for better security and performance
            ];

            // Create a new PDO instance
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch (PDOException $exception) {
            // Catch any PDO exceptions (e.g., connection failed)
            echo "<div style='color: red; padding: 10px; border: 1px solid red; background-color: #ffe6e6;'>";
            echo "<strong>Database Connection Error:</strong> " . $exception->getMessage();
            echo "<br>Please check your DB_HOST, DB_NAME, DB_USER, and DB_PASS in the PHP code.";
            echo "<br>Also, ensure your MySQL server is running and the database/table exists.";
            echo "</div>";
            // In a production environment, you should log this error securely
            // and display a generic, user-friendly message to the user.
        }

        return $this->conn;
    }

    /**
     * Closes the database connection.
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

// --- Main Application Logic ---

// Initialize database connection
$database = new Database(DB_HOST, DB_NAME, DB_USER, DB_PASS);
$conn = $database->getConnection();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Backend Interaction</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #0056b3; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        form { margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; background-color: #fafafa; }
        form label { display: block; margin-bottom: 5px; font-weight: bold; }
        form input[type="text"],
        form input[type="email"],
        form input[type="password"] {
            width: calc(100% - 22px); /* Account for padding and border */
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        form button {
            background-color: #007bff;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        form button:hover {
            background-color: #0056b3;
        }
        .message { padding: 10px; margin-bottom: 15px; border-radius: 5px; }
        .message.success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
        .message.error { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PHP Backend Database Interaction</h1>

        <?php if ($conn): ?>
            <p class="message success">Database connection established successfully!</p>

            <?php
            $message = '';
            $message_type = '';

            // --- Handle Form Submissions ---
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (isset($_POST['action'])) {
                    try {
                        switch ($_POST['action']) {
                            case 'create_user':
                                $name = $_POST['name'] ?? '';
                                $email = $_POST['email'] ?? '';
                                $password = $_POST['password'] ?? '';

                                if (!empty($name) && !empty($email) && !empty($password)) {
                                    $password_hash = password_hash($password, PASSWORD_DEFAULT); // Hash the password
                                    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password_hash)");
                                    $stmt->bindParam(':name', $name);
                                    $stmt->bindParam(':email', $email);
                                    $stmt->bindParam(':password_hash', $password_hash);
                                    $stmt->execute();
                                    $message = "User '{$name}' created successfully!";
                                    $message_type = 'success';
                                } else {
                                    $message = "All fields are required for creating a user.";
                                    $message_type = 'error';
                                }
                                break;

                            case 'update_user':
                                $id = $_POST['id'] ?? 0;
                                $new_email = $_POST['new_email'] ?? '';

                                if ($id > 0 && !empty($new_email)) {
                                    $stmt = $conn->prepare("UPDATE users SET email = :email WHERE id = :id");
                                    $stmt->bindParam(':email', $new_email);
                                    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                                    $stmt->execute();
                                    if ($stmt->rowCount() > 0) {
                                        $message = "User ID {$id} updated successfully!";
                                        $message_type = 'success';
                                    } else {
                                        $message = "No user found with ID {$id} or no changes made.";
                                        $message_type = 'error';
                                    }
                                } else {
                                    $message = "User ID and new email are required for updating.";
                                    $message_type = 'error';
                                }
                                break;

                            case 'delete_user':
                                $id = $_POST['id'] ?? 0;

                                if ($id > 0) {
                                    $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
                                    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                                    $stmt->execute();
                                    if ($stmt->rowCount() > 0) {
                                        $message = "User ID {$id} deleted successfully!";
                                        $message_type = 'success';
                                    } else {
                                        $message = "No user found with ID {$id}.";
                                        $message_type = 'error';
                                    }
                                } else {
                                    $message = "User ID is required for deleting.";
                                    $message_type = 'error';
                                }
                                break;
                        }
                    } catch (PDOException $e) {
                        $message = "Database operation failed: " . $e->getMessage();
                        $message_type = 'error';
                    }
                }
            }

            // Display messages
            if (!empty($message)) {
                echo "<div class='message {$message_type}'>{$message}</div>";
            }
            ?>

            <h2>Current Users</h2>
            <?php
            try {
                // READ Operation: Fetch all users
                $stmt = $conn->query("SELECT id, name, email FROM users ORDER BY id DESC");
                $users = $stmt->fetchAll();

                if (count($users) > 0) {
                    echo "<table>";
                    echo "<thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>";
                    echo "<tbody>";
                    foreach ($users as $user) {
                        echo "<tr>";
                        echo "<td>" . htmlspecialchars($user['id']) . "</td>";
                        echo "<td>" . htmlspecialchars($user['name']) . "</td>";
                        echo "<td>" . htmlspecialchars($user['email']) . "</td>";
                        echo "</tr>";
                    }
                    echo "</tbody>";
                    echo "</table>";
                } else {
                    echo "<p>No users found in the database. Try creating one!</p>";
                }
            } catch (PDOException $e) {
                echo "<p class='error'>Error fetching users: " . $e->getMessage() . "</p>";
            }
            ?>

            <h2>Create New User</h2>
            <form method="POST">
                <input type="hidden" name="action" value="create_user">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required><br>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br>
                <button type="submit">Create User</button>
            </form>

            <h2>Update User Email</h2>
            <form method="POST">
                <input type="hidden" name="action" value="update_user">
                <label for="update_id">User ID to Update:</label>
                <input type="text" id="update_id" name="id" required pattern="[0-9]+" title="Please enter a numeric ID"><br>
                <label for="new_email">New Email:</label>
                <input type="email" id="new_email" name="new_email" required><br>
                <button type="submit">Update User</button>
            </form>

            <h2>Delete User</h2>
            <form method="POST">
                <input type="hidden" name="action" value="delete_user">
                <label for="delete_id">User ID to Delete:</label>
                <input type="text" id="delete_id" name="id" required pattern="[0-9]+" title="Please enter a numeric ID"><br>
                <button type="submit">Delete User</button>
            </form>

        <?php else: ?>
            <p class="message error">Could not connect to the database. Please check the error message above.</p>
        <?php endif; ?>

    </div>
</body>
</html>

<?php
// Close the database connection when the script finishes
if ($conn) {
    $database->closeConnection();
}

/**
 * Sample SQL to create the 'users' table (run this in your MySQL client):
 *
 * CREATE TABLE users (
 * id INT AUTO_INCREMENT PRIMARY KEY,
 * name VARCHAR(255) NOT NULL,
 * email VARCHAR(255) NOT NULL UNIQUE,
 * password_hash VARCHAR(255) NOT NULL,
 * created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */
?>
