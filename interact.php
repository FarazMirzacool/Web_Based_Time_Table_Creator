<?php
session_start();

// To Check if user is logged in - check both session variable formats for compatibility
if (!isset($_SESSION['id']) && !isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

// to Set user name for display (check both session variable formats)
$userName = $_SESSION['name'] ?? $_SESSION['user_name'] ?? 'User';

require_once 'config_db.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interaction Dashboard</title>
    <link rel="stylesheet" href="interact.css">
</head>
<body>
    <!-- Header Section -->
    <header>
        <div class="container">
            <div class="header-content">
                <h1>Revolutionize Class Scheduling</h1>
                <p>Welcome, <?php echo htmlspecialchars($userName); ?>! Create perfect class schedules automatically with our intelligent timetable generator. Save time and eliminate conflicts effortlessly.</p>
                </div>
                <div class="features">
                    <div class="feature">
                        <i>✔</i>
                        <span>Easy to get started</span>
                    </div>
                    <div class="feature">
                        <i>✔</i>
                        <span>24/7 active</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Features Section -->
    <section class="features-section">
        <div class="container">
            <h2>Everything You Need for Perfect Scheduling</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⏱</div>
                    <h3>Time Optimization</h3>
                    <p>Automatically find the best time slots for all your classes while considering teacher availability and room constraints.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Conflict Resolution</h3>
                    <p>Our intelligent algorithm detects and resolves scheduling conflicts before they happen, saving you hours of manual work.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Analytics & Reports</h3>
                    <p>Gain insights into resource utilization and identify opportunities to optimize your academic schedule.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <h3>Staff Management</h3>
                    <p>Easily manage teacher schedules, preferences, and workload distribution across departments.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🏫</div>
                    <h3>Room Allocation</h3>
                    <p>Automatically assign classes to appropriate rooms based on capacity, equipment needs, and location.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Subject Allocation</h3>
                    <p>Assign subject to respective professors based on availability, time, requirements of the departments </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Demo Section -->
    <section class="demo-section">
        <div class="container">
            <div class="demo-container">
                <div class="demo-content">
                    <h2>See It In Action</h2>
                    <p>Our intelligent scheduling system automatically creates optimized timetables that respect all your constraints and preferences.</p>
                    <p>Using our Smart Scheduler helps transform complex scheduling requirements into a perfectly balanced timetable in minutes.</p>
                </div>
                <div class="demo-visual">
                    <h3>Sample Generated Schedule</h3>
                    <table class="schedule-preview">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>10:00-10:50</td>
                                <td>IWT</td>
                                <td>MIS</td>
                                <td>TOC</td>
                                <td>ML</td>
                                <td>TOC</td>
                            </tr>
                            <tr>
                                <td>10:50-11:40</td>
                                <td>LAB</td>
                                <td>TOC</td>
                                <td>ML</td>
                                <td>IWT</td>
                                <td>CODE</td>
                            </tr>
                            <tr>
                                <td>11:40-12:30</td>
                                <td>LAB</td>
                                <td>IWT</td>
                                <td>TOC</td>
                                <td>ML</td>
                                <td>TOC</td>
                            </tr>
                            <tr>
                                <td>12:30-1:30</td>
                                <td>TOC</td>
                                <td>ML</td>
                                <td>IWT</td>
                                <td>LAB</td>
                                <td>CODE</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <h2>Ready to Transform Your Scheduling Process?</h2>
            <p>Try revolutionized class scheduling with our intelligent solution.</p>
            <a href="dashboard.php" class="btn">Start Dashboard</a>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="copyright">
                    <p>&copy; 2025 SmartClass Scheduler. All rights reserved.</p>
                </div>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
        </div>
    </footer>
    <script src="interact.js"></script>
</body>
</html>