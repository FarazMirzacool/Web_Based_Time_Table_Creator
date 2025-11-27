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
    $sql = "SELECT teacher_id, teacher_name, year, semester, availability_json 
            FROM teachers 
            WHERE year = ? AND semester = ? 
            ORDER BY teacher_name";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $year, $semester);
} else {
    $sql = "SELECT teacher_id, teacher_name, year, semester, availability_json 
            FROM teachers 
            ORDER BY year, semester, teacher_name";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$teachers = [];
while ($row = $result->fetch_assoc()) {
    $teachers[] = $row;
}

echo json_encode($teachers);

$stmt->close();
$conn->close();
?>