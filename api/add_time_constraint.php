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
    $teacher_id = intval($_POST['teacher_id']);
    $day_of_week = trim($_POST['day_of_week']);
    $start_time = trim($_POST['start_time']);
    $end_time = trim($_POST['end_time']);
    $year = intval($_POST['year']);
    $semester = intval($_POST['semester']);
    
    // Validate input
    if ($teacher_id <= 0 || empty($day_of_week) || empty($start_time) || empty($end_time)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    // Get current availability JSON
    $get_sql = "SELECT availability_json FROM teachers WHERE teacher_id = ?";
    $get_stmt = $conn->prepare($get_sql);
    $get_stmt->bind_param("i", $teacher_id);
    $get_stmt->execute();
    $result = $get_stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Teacher not found']);
        exit();
    }
    
    $row = $result->fetch_assoc();
    $availability = json_decode($row['availability_json'], true) ?: [];
    
    // Add new constraint
    $constraint = [
        'day' => $day_of_week,
        'start_time' => $start_time,
        'end_time' => $end_time,
        'year' => $year,
        'semester' => $semester
    ];
    
    $availability[] = $constraint;
    
    // Update availability JSON
    $update_sql = "UPDATE teachers SET availability_json = ? WHERE teacher_id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $json_availability = json_encode($availability);
    $update_stmt->bind_param("si", $json_availability, $teacher_id);
    
    if ($update_stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Time constraint added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding time constraint: ' . $conn->error]);
    }
    
    $update_stmt->close();
    $get_stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>