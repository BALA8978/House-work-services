<?php
// Allow any origin to access (for dev purpose)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database connection credentials
$servername = "localhost";
$username = "root";          // By default in XAMPP, user is root
$password = "";              // By default password is empty
$dbname = "techniciansdatabase"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Return HTTP 500 error if DB connection failed
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Your SQL query to fetch all technicians
$sql = "SELECT * FROM technicians_details";

$result = $conn->query($sql);

$technicians = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert comma-separated services string to trimmed array elements
        $services = array_map('trim', explode(",", $row["services"]));

        $technicians[] = [
            "id" => $row["id"],
            "name" => $row["name"],
            "isAvailable" => boolval($row["isAvailable"]),
            "rating" => floatval($row["rating"]),
            "experience" => intval($row["experience"]),
            "services" => $services,
            "price" => intval($row["price"])
        ];
    }
} else {
    // No results found, return empty array
    $technicians = [];
}

// Output JSON with pretty print (optional)
echo json_encode($technicians, JSON_PRETTY_PRINT);

// Close connection
$conn->close();
?>
