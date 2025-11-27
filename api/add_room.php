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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $room_name = trim($_POST['room_name']);
    $year = intval($_POST['year']);
    $semester = intval($_POST['semester']);
    
    // Validate input
    if (empty($room_name) || $year <= 0 || $semester <= 0) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    // Check if room already exists for this year and semester
    $check_sql = "SELECT room_id FROM rooms WHERE room_name = ? AND year = ? AND semester = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("sii", $room_name, $year, $semester);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Room already exists for this year and semester']);
        exit();
    }
    
    // Insert new room
    $sql = "INSERT INTO rooms (room_name, year, semester) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $room_name, $year, $semester);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding room: ' . $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>