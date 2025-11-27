<?php
header('Content-Type: application/json');
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "users_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

$year = isset($_GET['year']) ? intval($_GET['year']) : 0;
$semester = isset($_GET['semester']) ? intval($_GET['semester']) : 0;

if ($year > 0 && $semester > 0) {
    $sql = "SELECT room_id, room_name, year, semester 
            FROM rooms 
            WHERE year = ? AND semester = ? 
            ORDER BY room_name";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
} else {
    $sql = "SELECT room_id, room_name, year, semester 
            FROM rooms 
            ORDER BY year, semester, room_name";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$rooms = [];
while ($row = $result->fetch_assoc()) {
    $rooms[] = $row;
}

echo json_encode($rooms);

$stmt->close();
$conn->close();
?>