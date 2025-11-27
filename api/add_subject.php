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
    $subject_name = trim($_POST['subject_name']);
    $year = intval($_POST['year']);
    $semester = intval($_POST['semester']);
    
    // Validate input
    if (empty($subject_name) || $year <= 0 || $semester <= 0) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    // Check if subject already exists for this year and semester
    $check_sql = "SELECT subject_id FROM subjects WHERE subject_name = ? AND year = ? AND semester = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("sii", $subject_name, $year, $semester);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Subject already exists for this year and semester']);
        exit();
    }
    
    // Insert new subject
    $sql = "INSERT INTO subjects (subject_name, year, semester) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $subject_name, $year, $semester);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Subject added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding subject: ' . $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>