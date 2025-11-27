<?php
header('Content-Type: application/json');
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) && !isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit();
}

// 1. Database Connection (Assuming config_db.php exists and provides $conn)
require_once 'config_db.php'; 

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

// 2. Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$assignment_id = $data['assignment_id'] ?? null;
$teacher_id = $data['teacher_id'] ?? null;
$subject_id = $data['subject_id'] ?? null;
$room_id = $data['room_id'] ?? null;
$day_of_week = $data['day_of_week'] ?? null;
$time_slot = $data['time_slot'] ?? null;

// 3. Validation
if (empty($assignment_id) || empty($teacher_id) || empty($subject_id) || empty($room_id) || empty($day_of_week) || $time_slot === null) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields for update.']);
    $conn->close();
    exit();
}

// Ensure time_slot is an integer
$time_slot = (int)$time_slot;
$teacher_id = (int)$teacher_id;
$subject_id = (int)$subject_id;
$room_id = (int)$room_id;

// 4. Check for Conflict (Hard constraint: Same Day/Time/Room conflict)
$check_sql = "SELECT id, subject_id, teacher_id FROM timetable_assignments 
              WHERE day_of_week = ? AND time_slot = ? AND room_id = ? AND id != ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("siii", $day_of_week, $time_slot, $room_id, $assignment_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    $existing_assignment = $check_result->fetch_assoc();
    echo json_encode([
        'success' => false, 
        'message' => 'Conflict: Room is already booked for this Day and Time Slot by Assignment ID ' . $existing_assignment['id'] . '.'
    ]);
    $check_stmt->close();
    $conn->close();
    exit();
}
$check_stmt->close();


// 5. Update Query using Prepared Statement
$update_sql = "UPDATE `timetable_assignments` 
               SET `teacher_id` = ?, 
                   `subject_id` = ?, 
                   `room_id` = ?, 
                   `day_of_week` = ?, 
                   `time_slot` = ? 
               WHERE `id` = ?";

$stmt = $conn->prepare($update_sql);

// Bind parameters: isiss (Integer, Integer, Integer, String, Integer, Integer)
$stmt->bind_param("iiisii", $teacher_id, $subject_id, $room_id, $day_of_week, $time_slot, $assignment_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Assignment updated successfully!']);
    } else {
        // This might happen if the new data is exactly the same as the old data
        echo json_encode(['success' => true, 'message' => 'Assignment data remains unchanged.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database update failed: ' . $stmt->error]);
}

// 6. Close connection
$stmt->close();
$conn->close();
?>