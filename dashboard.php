<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) && !isset($_SESSION['id'])) {
    header("Location: index.php");
    exit();
}

// Database connection for user info
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "users_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get user info
$user_id = $_SESSION['user_id'] ?? $_SESSION['id'];

$sql = "SELECT * FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    session_destroy();
    header("Location: index.php");
    exit();
}

$user = $result->fetch_assoc();

// Get years and semesters for dropdowns
$college_years = range(1, 4);
$college_semesters = range(1, 8);

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Time Table Scheduler</title>
    <link rel="stylesheet" href="dashboard.css">
    <link rel="stylesheet" href="timetable.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="logo">
            <i class="fas fa-calendar-alt"></i>
            <span>Smart Time Table Scheduler</span>
        </div>
        <div class="user-menu">
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span><?php echo htmlspecialchars($_SESSION['user_name'] ?? $_SESSION['name'] ?? 'User'); ?></span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="dropdown-menu">
                <a href="#" id="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Animation Section -->
        <section class="animation-section">
            <div class="time-table-animation">
                <div class="slot" style="--delay: 0s">10:00-10:50</div>
                <div class="slot" style="--delay: 0.2s">10:50-11:40</div>
                <div class="slot" style="--delay: 0.4s">11:40-12:30</div>
                <div class="slot" style="--delay: 0.6s">12:30-1:30</div>
                <div class="slot lunch" style="--delay: 0.8s">1:30-2:10 (Lunch)</div>
                <div class="slot" style="--delay: 1s">2:10-3:00</div>
                <div class="slot" style="--delay: 1.2s">3:00-3:50</div>
                <div class="slot" style="--delay: 1.4s">3:50-4:40</div>
                <div class="slot" style="--delay: 1.6s">4:40-5:00</div>
            </div>
        </section>

        <!-- Cards Section -->
        <section class="cards-section">
            <div class="cards-container">
                <!-- Add New Teacher Card -->
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <h3>Add New Teacher</h3>
                    </div>
                    <div class="card-body">
                        <form id="add-teacher-form">
                            <div class="form-group">
                                <label for="teacher-name">Teacher Name</label>
                                <input type="text" id="teacher-name" name="teacher_name" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="teacher-year">Year</label>
                                    <select id="teacher-year" name="year" required>
                                        <option value="">Select Year</option>
                                        <?php foreach ($college_years as $year): ?>
                                            <option value="<?php echo $year; ?>">Year <?php echo $year; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="teacher-semester">Semester</label>
                                    <select id="teacher-semester" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <?php foreach ($college_semesters as $semester): ?>
                                            <option value="<?php echo $semester; ?>">Semester <?php echo $semester; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary">Add Teacher</button>
                        </form>
                    </div>
                </div>

                <!-- Add New Subject Card -->
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-book"></i>
                        <h3>Add New Subject</h3>
                    </div>
                    <div class="card-body">
                        <form id="add-subject-form">
                            <div class="form-group">
                                <label for="subject-name">Subject Name</label>
                                <input type="text" id="subject-name" name="subject_name" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="subject-year">Year</label>
                                    <select id="subject-year" name="year" required>
                                        <option value="">Select Year</option>
                                        <?php foreach ($college_years as $year): ?>
                                            <option value="<?php echo $year; ?>">Year <?php echo $year; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="subject-semester">Semester</label>
                                    <select id="subject-semester" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <?php foreach ($college_semesters as $semester): ?>
                                            <option value="<?php echo $semester; ?>">Semester <?php echo $semester; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary">Add Subject</button>
                        </form>
                    </div>
                </div>

                <!-- Add New Room Card -->
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-door-open"></i>
                        <h3>Add New Room</h3>
                    </div>
                    <div class="card-body">
                        <form id="add-room-form">
                            <div class="form-group">
                                <label for="room-name">Room Name/Number</label>
                                <input type="text" id="room-name" name="room_name" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="room-year">Year</label>
                                    <select id="room-year" name="year" required>
                                        <option value="">Select Year</option>
                                        <?php foreach ($college_years as $year): ?>
                                            <option value="<?php echo $year; ?>">Year <?php echo $year; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="room-semester">Semester</label>
                                    <select id="room-semester" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <?php foreach ($college_semesters as $semester): ?>
                                            <option value="<?php echo $semester; ?>">Semester <?php echo $semester; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary">Add Room</button>
                        </form>
                    </div>
                </div>

                <!-- Manual Timetable Assignment Card -->
                <div class="card wide-card">
                    <div class="card-header">
                        <i class="fas fa-edit"></i>
                        <h3>Manual Timetable Assignment</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="assign-year">Year</label>
                                <select id="assign-year" name="year" required>
                                    <option value="">Select Year</option>
                                    <?php foreach ($college_years as $year): ?>
                                        <option value="<?php echo $year; ?>">Year <?php echo $year; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="assign-semester">Semester</label>
                                <select id="assign-semester" name="semester" required>
                                    <option value="">Select Semester</option>
                                    <?php foreach ($college_semesters as $semester): ?>
                                        <option value="<?php echo $semester; ?>">Semester <?php echo $semester; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <button id="load-assignments" class="btn-secondary">Load Assignments</button>
                        </div>

                        <div class="assignment-form">
                            <h4>Add New Assignment</h4>
                            <form id="assignment-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="assign-teacher">Teacher</label>
                                        <select id="assign-teacher" name="teacher_id" required>
                                            <option value="">Select Teacher</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="assign-subject">Subject</label>
                                        <select id="assign-subject" name="subject_id" required>
                                            <option value="">Select Subject</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="assign-room">Room</label>
                                        <select id="assign-room" name="room_id" required>
                                            <option value="">Select Room</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="assign-day">Day</label>
                                        <select id="assign-day" name="day_of_week" required>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="assign-time-slot">Time Slot</label>
                                        <select id="assign-time-slot" name="time_slot" required>
                                            <option value="0">10:00-10:50</option>
                                            <option value="1">10:50-11:40</option>
                                            <option value="2">11:40-12:30</option>
                                            <option value="3">12:30-1:30</option>
                                            <option value="4">1:30-2:10 (Lunch)</option>
                                            <option value="5">2:10-3:00</option>
                                            <option value="6">3:00-3:50</option>
                                            <option value="7">3:50-4:40</option>
                                            <option value="8">4:40-5:00</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="assign-is-lab" name="is_lab" value="1">
                                            This is a Lab Session
                                        </label>
                                    </div>
                                    <div class="form-group" id="assign-lab-duration-group" style="display: none;">
                                        <label for="assign-lab-duration">Lab Duration (slots)</label>
                                        <select id="assign-lab-duration" name="lab_duration">
                                            <option value="1">1 Slot (50 min)</option>
                                            <option value="2">2 Slots (100 min)</option>
                                        </select>
                                    </div>
                                    <div class="form-group" id="assign-lab-batch-group" style="display: none;">
                                        <label for="assign-lab-batch">Lab Batch</label>
                                        <select id="assign-lab-batch" name="lab_batch">
                                            <option value="P1">Batch P1</option>
                                            <option value="P2">Batch P2</option>
                                            <option value="ALL">All Batches</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" class="btn-primary">Save Assignment</button>
                            </form>
                        </div>
                    </div>
                </div>
                <!-- Generate Timetable Card -->
                <div class="card wide-card">
                    <div class="card-header">
                        <i class="fas fa-table"></i>
                        <h3>Generate Timetable</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="generate-year">Year</label>
                                <select id="generate-year" name="year" required>
                                    <option value="">Select Year</option>
                                    <?php foreach ($college_years as $year): ?>
                                        <option value="<?php echo $year; ?>">Year <?php echo $year; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="generate-semester">Semester</label>
                                <select id="generate-semester" name="semester" required>
                                    <option value="">Select Semester</option>
                                    <?php foreach ($college_semesters as $semester): ?>
                                        <option value="<?php echo $semester; ?>">Semester <?php echo $semester; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="view-type">View Type</label>
                                <select id="view-type" name="view_type" required>
                                    <option value="student">Student View</option>
                                    <option value="teacher">Teacher View</option>
                                    <option value="room">Room View</option>
                                </select>
                            </div>
                        </div>
                        <button id="generate-timetable" class="btn-primary">Generate Timetable</button>

                        <div id="timetable-result" class="timetable-result">
                            <p class="no-data">Timetable will be displayed here after generation</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Logout Confirmation Modal -->
    <div id="logout-modal" class="modal">
        <div class="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div class="modal-actions">
                <button id="confirm-logout" class="btn-danger">Yes, Logout</button>
                <button id="cancel-logout" class="btn-secondary">Cancel</button>
            </div>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>