<?php
header('Content-Type: application/json');
session_start(); // <-- ADDED: Start session for security

// Check if user is logged in  // <-- ADDED: Security check
if (!isset($_SESSION['user_id'])) {
    // Return unauthorized status/message if needed, but for a data fetch, 
    // simply preventing access is key.
    echo json_encode([]); 
    exit();
}

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "users_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Check if we're getting a specific assignment by ID
$assignment_id = intval($_GET['id'] ?? 0);

if ($assignment_id > 0) {
    // Get specific assignment by ID (used for editing/details)
    $sql = "SELECT ta.*, t.teacher_name, s.subject_name, r.room_name 
            FROM timetable_assignments ta
            LEFT JOIN teachers t ON ta.teacher_id = t.teacher_id
            LEFT JOIN subjects s ON ta.subject_id = s.subject_id
            LEFT JOIN rooms r ON ta.room_id = r.room_id
            WHERE ta.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $assignment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $assignment = $result->fetch_assoc();
        echo json_encode($assignment);
    } else {
        echo json_encode(['success' => false, 'message' => 'Assignment not found']);
    }
    
    $stmt->close();
} else {
    // Get all assignments for year/semester (used for timetable generation)
    $year = intval($_GET['year'] ?? 0);
    $semester = intval($_GET['semester'] ?? 0);

    if ($year <= 0 || $semester <= 0) {
        // Return empty array if parameters are missing for safety
        echo json_encode([]);
        exit;
    }

    $sql = "SELECT ta.*, t.teacher_name, s.subject_name, r.room_name 
            FROM timetable_assignments ta
            LEFT JOIN teachers t ON ta.teacher_id = t.teacher_id
            LEFT JOIN subjects s ON ta.subject_id = s.subject_id
            LEFT JOIN rooms r ON ta.room_id = r.room_id
            WHERE ta.year = ? AND ta.semester = ?
            ORDER BY FIELD(ta.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), ta.time_slot"; // <-- Improved sorting
            

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
    $stmt->execute();
    $result = $stmt->get_result();

    $assignments = [];
    while ($row = $result->fetch_assoc()) {
        $assignments[] = $row;
    }

    echo json_encode($assignments);
    $stmt->close();
}

$conn->close();
?>