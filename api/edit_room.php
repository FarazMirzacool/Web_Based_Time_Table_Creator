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
    $input = json_decode(file_get_contents('php://input'), true);
    
    $room_id = intval($input['room_id']);
    $room_name = trim($input['room_name']);
    
    if ($room_id <= 0 || empty($room_name)) {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        exit();
    }
    
    $sql = "UPDATE rooms SET room_name = ? WHERE room_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $room_name, $room_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating room: ' . $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>