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
$view_type = isset($_GET['view_type']) ? $_GET['view_type'] : 'student';

if ($year <= 0 || $semester <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid year or semester']);
    exit();
}

// Enhanced timetable generation with lab session support
function generateEnhancedTimetable($year, $semester, $view_type) {
    global $conn;
    
    // Get all necessary data
    $teachers = getTeachers($year, $semester);
    $subjects = getSubjects($year, $semester);
    $rooms = getRooms($year, $semester);
    
    // Define time slots for your college
    $time_slots = [
        ['start' => '10:00:00', 'end' => '10:50:00', 'duration' => 50],
        ['start' => '10:50:00', 'end' => '11:40:00', 'duration' => 50],
        ['start' => '11:40:00', 'end' => '12:30:00', 'duration' => 50],
        ['start' => '12:30:00', 'end' => '13:30:00', 'duration' => 60],
        ['start' => '13:30:00', 'end' => '14:10:00', 'duration' => 40], // Lunch
        ['start' => '14:10:00', 'end' => '15:00:00', 'duration' => 50],
        ['start' => '15:00:00', 'end' => '15:50:00', 'duration' => 50],
        ['start' => '15:50:00', 'end' => '16:40:00', 'duration' => 50],
        ['start' => '16:40:00', 'end' => '17:00:00', 'duration' => 20]
    ];
    
    $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    $timetable = [];
    
    // Generate timetable entries
    foreach ($days as $day) {
        foreach ($time_slots as $slot_index => $slot) {
            // Skip lunch break
            if ($slot_index == 4) continue;
            
            // Check if this could be part of a lab session
            $is_lab = false;
            $lab_duration = 1; // Default 1 slot
            
            // Determine if this should be a lab session (random for demo, replace with your logic)
            if (($slot_index == 0 || $slot_index == 1 || $slot_index == 5 || $slot_index == 6) && rand(0, 3) == 0) {
                $is_lab = true;
                $lab_duration = 2; // Lab spans 2 time slots
                
                // If this is the second slot of a lab, skip it
                if ($slot_index == 1 && isset($timetable[$day][0]) && $timetable[$day][0]['is_lab'] && $timetable[$day][0]['lab_duration'] == 2) {
                    continue;
                }
                if ($slot_index == 6 && isset($timetable[$day][5]) && $timetable[$day][5]['is_lab'] && $timetable[$day][5]['lab_duration'] == 2) {
                    continue;
                }
            }
            
            // Create timetable entry
            $teacher = $teachers[array_rand($teachers)];
            $subject = $subjects[array_rand($subjects)];
            $room = $rooms[array_rand($rooms)];
            
            $entry = [
                'id' => count($timetable) + 1,
                'teacher_id' => $teacher['teacher_id'],
                'teacher_name' => $teacher['teacher_name'],
                'subject_id' => $subject['subject_id'],
                'subject_name' => $subject['subject_name'],
                'room_id' => $room['room_id'],
                'room_name' => $room['room_name'],
                'day_of_week' => $day,
                'start_time' => $slot['start'],
                'end_time' => $slot['end'],
                'time_slot' => $slot_index,
                'is_lab' => $is_lab,
                'lab_duration' => $lab_duration,
                'lab_batch' => $is_lab ? (rand(0, 1) ? 'P1' : 'P2') : ''
            ];
            
            // For lab sessions spanning multiple slots, adjust the end time
            if ($is_lab && $lab_duration > 1) {
                if ($slot_index == 0) {
                    $entry['end_time'] = $time_slots[1]['end']; // Extend to next slot
                } elseif ($slot_index == 5) {
                    $entry['end_time'] = $time_slots[6]['end']; // Extend to next slot
                }
            }
            
            $timetable[] = $entry;
        }
    }
    
    return $timetable;
}

// Helper functions
function getTeachers($year, $semester) {
    global $conn;
    $sql = "SELECT teacher_id, teacher_name FROM teachers WHERE year = ? AND semester = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $teachers = [];
    while ($row = $result->fetch_assoc()) {
        $teachers[] = $row;
    }
    return $teachers;
}

function getSubjects($year, $semester) {
    global $conn;
    $sql = "SELECT subject_id, subject_name FROM subjects WHERE year = ? AND semester = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $subjects = [];
    while ($row = $result->fetch_assoc()) {
        $subjects[] = $row;
    }
    return $subjects;
}

function getRooms($year, $semester) {
    global $conn;
    $sql = "SELECT room_id, room_name FROM rooms WHERE year = ? AND semester = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    return $rooms;
}

// Generate the timetable
$timetable_data = generateEnhancedTimetable($year, $semester, $view_type);

echo json_encode([
    'success' => true,
    'timetable' => $timetable_data,
    'message' => 'Timetable generated successfully with lab session support'
]);

$conn->close();
?>