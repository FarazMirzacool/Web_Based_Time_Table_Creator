<?php
header('Content-Type: application/json');
session_start(); // <-- ADDED: Start session for security

// Check if user is logged in  // <-- ADDED: Security check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please log in.']);
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
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['year', 'semester', 'teacher_id', 'subject_id', 'room_id', 'day_of_week', 'time_slot'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    $year = intval($data['year']);
    $semester = intval($data['semester']);
    $teacher_id = intval($data['teacher_id']);
    $subject_id = intval($data['subject_id']);
    $room_id = intval($data['room_id']);
    $day_of_week = $conn->real_escape_string($data['day_of_week']);
    $time_slot = intval($data['time_slot']);
    
    // Ensure boolean and integer types are correctly handled from JSON input
    $is_lab = isset($data['is_lab']) ? (bool)$data['is_lab'] : false;
    $lab_duration = isset($data['lab_duration']) ? intval($data['lab_duration']) : 1;
    $lab_batch = isset($data['lab_batch']) ? $conn->real_escape_string($data['lab_batch']) : '';

    // If it's not a lab session, ensure lab-specific fields are reset (standardizing data)
    if (!$is_lab) {
        $lab_duration = 1;
        $lab_batch = '';
    }
    
    // Lunch Break Check (Slot 4)
    if ($time_slot == 4) {
        echo json_encode(['success' => false, 'message' => 'Cannot assign class during Lunch Break slot (1:30-2:10).']);
        exit();
    }

    // Check for conflicts - Teacher conflict
    $teacher_conflict_sql = "SELECT id FROM timetable_assignments 
                  WHERE year = ? AND semester = ? AND day_of_week = ? AND time_slot = ? 
                  AND teacher_id = ?";
    $teacher_stmt = $conn->prepare($teacher_conflict_sql);
    $teacher_stmt->bind_param("iissi", $year, $semester, $day_of_week, $time_slot, $teacher_id);
    $teacher_stmt->execute();
    $teacher_result = $teacher_stmt->get_result();
    
    if ($teacher_result->num_rows > 0) {
        $teacher_stmt->close(); // Close statement before exit
        echo json_encode(['success' => false, 'message' => 'Conflict detected: Teacher already booked for this time slot']);
        exit;
    }
    $teacher_stmt->close();
    
    // Check for conflicts - Room conflict
    $room_conflict_sql = "SELECT id FROM timetable_assignments 
                  WHERE year = ? AND semester = ? AND day_of_week = ? AND time_slot = ? 
                  AND room_id = ?";
    $room_stmt = $conn->prepare($room_conflict_sql);
    $room_stmt->bind_param("iissi", $year, $semester, $day_of_week, $time_slot, $room_id);
    $room_stmt->execute();
    $room_result = $room_stmt->get_result();
    
    if ($room_result->num_rows > 0) {
        $room_stmt->close(); // Close statement before exit
        echo json_encode(['success' => false, 'message' => 'Conflict detected: Room already booked for this time slot']);
        exit;
    }
    $room_stmt->close();
    
    // Insert the assignment
    $sql = "INSERT INTO timetable_assignments 
            (year, semester, teacher_id, subject_id, room_id, day_of_week, time_slot, is_lab, lab_duration, lab_batch) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    // Binding parameters: iiiiisiiis -> (int, int, int, int, int, string, int, int, int, string)
    // Note: is_lab is a boolean in DB, but treated as INT (0/1) in MySQL binding
    $stmt->bind_param("iiiiisiiis", $year, $semester, $teacher_id, $subject_id, $room_id, $day_of_week, $time_slot, $is_lab, $lab_duration, $lab_batch);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Timetable assignment created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating timetable assignment: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>