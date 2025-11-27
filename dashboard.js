// Dashboard JavaScript with Enhanced Database Integration
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const logoutModal = document.getElementById('logout-modal');

    const addTeacherForm = document.getElementById('add-teacher-form');
    const addSubjectForm = document.getElementById('add-subject-form');
    const addRoomForm = document.getElementById('add-room-form');

    const generateTimetableBtn = document.getElementById('generate-timetable');
    const generateYear = document.getElementById('generate-year');
    const generateSemester = document.getElementById('generate-semester');
    const viewType = document.getElementById('view-type');
    const timetableResult = document.getElementById('timetable-result');

    // Assignment Management
    const loadAssignmentsBtn = document.getElementById('load-assignments');
    const assignmentForm = document.getElementById('assignment-form');
    const assignYear = document.getElementById('assign-year');
    const assignSemester = document.getElementById('assign-semester');
    const assignTeacher = document.getElementById('assign-teacher');
    const assignSubject = document.getElementById('assign-subject');
    const assignRoom = document.getElementById('assign-room');
    const assignIsLab = document.getElementById('assign-is-lab');
    const assignLabDurationGroup = document.getElementById('assign-lab-duration-group');
    const assignLabBatchGroup = document.getElementById('assign-lab-batch-group');

    // State management
    let currentAssignments = [];
    let isLoading = false;

    // Configuration
    const CONFIG = {
        timeSlots: {
            0: '10:00-10:50',
            1: '10:50-11:40',
            2: '11:40-12:30',
            3: '12:30-1:30',
            4: '1:30-2:10 (Lunch)',
            5: '2:10-3:00',
            6: '3:00-3:50',
            7: '3:50-4:40',
            8: '4:40-5:00'
        },
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };

    // Logout functionality
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logoutModal.style.display = 'flex';
    });

    confirmLogoutBtn.addEventListener('click', function () {
        window.location.href = 'logout.php';
    });

    cancelLogoutBtn.addEventListener('click', function () {
        logoutModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });

    // Enhanced fetch with timeout
    function fetchWithTimeout(url, options = {}, timeout = 10000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);
    }

    // Form submission handler with better error handling
    function handleFormSubmission(formElement, endpoint, successMessage, refreshCallback = null) {
        return function (e) {
            e.preventDefault();

            if (isLoading) return;

            const formData = new FormData(this);
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;

            // Show loading state
            button.innerHTML = '<span class="loading"></span> Processing...';
            button.disabled = true;
            isLoading = true;

            // AJAX call
            fetch(endpoint, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showMessage(successMessage || data.message, 'success');
                        formElement.reset();

                        if (refreshCallback && typeof refreshCallback === 'function') {
                            refreshCallback();
                        }
                    } else {
                        showMessage(data.message || 'Operation failed', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('Error processing request. Please try again.', 'error');
                })
                .finally(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                    isLoading = false;
                });
        };
    }

    // Add Teacher Form Submission
    addTeacherForm.addEventListener('submit', handleFormSubmission(
        addTeacherForm,
        'api/add_teacher.php',
        'Teacher added successfully!'
    ));

    // Add Subject Form Submission
    addSubjectForm.addEventListener('submit', handleFormSubmission(
        addSubjectForm,
        'api/add_subject.php',
        'Subject added successfully!'
    ));

    // Add Room Form Submission
    addRoomForm.addEventListener('submit', handleFormSubmission(
        addRoomForm,
        'api/add_room.php',
        'Room added successfully!'
    ));

    // Reusable function to load and populate dropdowns
    function loadAndPopulateDropdown(url, dropdownElement, defaultOptionText, errorMsg) {
        return fetchWithTimeout(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                dropdownElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        const option = document.createElement('option');
                        if (url.includes('get_teachers')) {
                            option.value = item.teacher_id;
                            option.textContent = item.teacher_name;
                        } else if (url.includes('get_subjects')) {
                            option.value = item.subject_id;
                            option.textContent = item.subject_name;
                        } else if (url.includes('get_rooms')) {
                            option.value = item.room_id;
                            option.textContent = item.room_name;
                        }
                        dropdownElement.appendChild(option);
                    });
                } else {
                    console.error('Data is not an array:', data);
                    showMessage(errorMsg, 'error');
                }
            })
            .catch(error => {
                console.error(`Error loading ${errorMsg.toLowerCase()}:`, error);
                showMessage(errorMsg, 'error');
                throw error;
            });
    }

    // Load data for assignment dropdowns
    function loadTeachersForAssignment(year, semester) {
        return loadAndPopulateDropdown(`api/get_teachers.php?year=${year}&semester=${semester}`, assignTeacher, 'Select Teacher', 'Error loading teachers');
    }

    function loadSubjectsForAssignment(year, semester) {
        return loadAndPopulateDropdown(`api/get_subjects.php?year=${year}&semester=${semester}`, assignSubject, 'Select Subject', 'Error loading subjects');
    }

    function loadRoomsForAssignment(year, semester) {
        return loadAndPopulateDropdown(`api/get_rooms.php?year=${year}&semester=${semester}`, assignRoom, 'Select Room', 'Error loading rooms');
    }

    // Load assignments and populate dropdowns (Manual Assignment Card)
    loadAssignmentsBtn.addEventListener('click', function () {
        const year = assignYear.value;
        const semester = assignSemester.value;

        if (!year || !semester) {
            showMessage('Please select both year and semester', 'error');
            return;
        }

        if (isLoading) return;

        // Show loading state
        const button = this;
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Loading...';
        button.disabled = true;
        isLoading = true;

        // Load teachers, subjects, rooms for this year/semester
        Promise.all([
            loadTeachersForAssignment(year, semester),
            loadSubjectsForAssignment(year, semester),
            loadRoomsForAssignment(year, semester)
        ]).then(() => {
            showMessage('Assignment data loaded successfully!', 'success');
        }).catch(error => {
            // Error handling is inside loadAndPopulateDropdown
        })
            .finally(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                isLoading = false;
            });
    });

    // Toggle lab options (Manual Assignment Card)
    assignIsLab.addEventListener('change', function () {
        if (this.checked) {
            assignLabDurationGroup.style.display = 'block';
            assignLabBatchGroup.style.display = 'block';
        } else {
            assignLabDurationGroup.style.display = 'none';
            assignLabBatchGroup.style.display = 'none';
        }
    });

    // Save assignment (Manual Assignment Card)
    assignmentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (isLoading) return;

        const year = assignYear.value;
        const semester = assignSemester.value;

        if (!year || !semester) {
            showMessage('Please select year and semester first', 'error');
            return;
        }

        const formData = new FormData(this);
        const isLab = formData.get('is_lab') === '1';
        const assignmentData = {
            year: parseInt(year),
            semester: parseInt(semester),
            teacher_id: parseInt(formData.get('teacher_id')),
            subject_id: parseInt(formData.get('subject_id')),
            room_id: parseInt(formData.get('room_id')),
            day_of_week: formData.get('day_of_week'),
            time_slot: parseInt(formData.get('time_slot')),
            is_lab: isLab
        };

        // Validation
        if (!assignmentData.teacher_id || !assignmentData.subject_id || !assignmentData.room_id ||
            !assignmentData.day_of_week || assignmentData.time_slot === undefined) {
            showMessage('Please fill all required fields', 'error');
            return;
        }

        // Only add lab-specific fields if it's a lab session
        if (isLab) {
            assignmentData.lab_duration = formData.get('lab_duration') ? parseInt(formData.get('lab_duration')) : 1;
            assignmentData.lab_batch = formData.get('lab_batch') || '';
        } else {
            // For non-lab sessions, explicitly set these to empty/default values
            assignmentData.lab_duration = 1;
            assignmentData.lab_batch = '';
        }

        // Show loading state
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Saving...';
        button.disabled = true;
        isLoading = true;

        // Save assignment
        fetch('api/save_timetable_assignment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showMessage(data.message, 'success');
                    assignmentForm.reset();
                    assignLabDurationGroup.style.display = 'none';
                    assignLabBatchGroup.style.display = 'none';

                    // Refresh timetable if it's already generated
                    if (generateYear.value && generateSemester.value) {
                        generateTimetableBtn.click();
                    }
                } else {
                    showMessage(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error saving assignment', 'error');
            })
            .finally(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                isLoading = false;
            });
    });

    // TIMETABLE GENERATION AND DISPLAY
    
    // Update the timetable generation to use assignment
    function generateTimetableFromAssignments(year, semester) {
        return fetchWithTimeout(`api/get_timetable_assignments.php?year=${year}&semester=${semester}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(assignments => {
                console.log('Raw assignments from API:', assignments);
                currentAssignments = assignments;
                
                // Convert assignments to timetable format
                const timetableData = assignments.map(assignment => ({
                    id: assignment.id,
                    teacher_id: assignment.teacher_id,
                    teacher_name: assignment.teacher_name,
                    subject_id: assignment.subject_id,
                    subject_name: assignment.subject_name,
                    room_id: assignment.room_id,
                    room_name: assignment.room_name,
                    day_of_week: assignment.day_of_week,
                    start_time: getStartTime(assignment.time_slot),
                    end_time: getEndTime(assignment.time_slot, assignment.lab_duration),
                    time_slot: assignment.time_slot,
                    is_lab: assignment.is_lab,
                    lab_duration: assignment.lab_duration,
                    lab_batch: assignment.lab_batch
                }));

                console.log('Processed timetable data:', timetableData);
                return timetableData;
            })
            .catch(error => {
                console.error('Error generating timetable:', error);
                throw error;
            });
    }

    // Helper functions for time conversion
    function getStartTime(timeSlot) {
        const timeMap = {
            0: '10:00:00', 1: '10:50:00', 2: '11:40:00', 3: '12:30:00',
            4: '13:30:00',
            5: '14:10:00', 6: '15:00:00', 7: '15:50:00', 8: '16:40:00'
        };
        return timeMap[timeSlot] || '10:00:00';
    }

    function getEndTime(timeSlot, labDuration = 1) {
        const timeMap = {
            0: '10:50:00', 1: '11:40:00', 2: '12:30:00', 3: '13:30:00',
            4: '14:10:00',
            5: '15:00:00', 6: '15:50:00', 7: '16:40:00', 8: '17:00:00'
        };

        // If it's a multi-slot lab, the end time is the end time of the last slot
        if (labDuration > 1) {
            const endSlot = parseInt(timeSlot) + parseInt(labDuration) - 1;
            return timeMap[endSlot] || timeMap[timeSlot];
        }

        return timeMap[timeSlot] || '10:50:00';
    }

    // Generate timetable function
    generateTimetableBtn.addEventListener('click', function () {
        const year = generateYear.value;
        const semester = generateSemester.value;
        const viewTypeValue = viewType.value;

        if (!year || !semester) {
            showMessage('Please select both year and semester', 'error');
            return;
        }

        if (isLoading) return;

        // Show loading state
        const button = this;
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Generating...';
        button.disabled = true;
        isLoading = true;

        // Generate timetable from assignments
        generateTimetableFromAssignments(year, semester)
            .then(timetableData => {
                console.log('Final timetable data for display:', timetableData);
                displayTimetable(timetableData, viewTypeValue, true);
                showMessage('Timetable generated successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error generating timetable', 'error');
                timetableResult.innerHTML = '<p class="error-message">Error generating timetable. Please check console for details.</p>';
            })
            .finally(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                isLoading = false;
            });
    });

    // Enhanced display function with edit capabilities
    function displayTimetable(timetableData, viewType, editable = false) {
        console.log('Displaying timetable with data:', timetableData);
        
        if (!timetableData || timetableData.length === 0) {
            timetableResult.innerHTML = `
                <div class="no-timetable-message">
                    <p>No timetable assignments found for the selected year and semester.</p>
                    <p>Use the "Manual Timetable Assignment" or "Lab Session Management" cards above to create your timetable.</p>
                </div>`;
            return;
        }

        let html = `<div class="timetable-container">
                        <div class="timetable-header">
                            <h3>Timetable - ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View</h3>
                            <div>
                                <button id="export-timetable" class="btn-secondary">
                                    <i class="fas fa-download"></i> Export
                                </button>
                                <button id="print-timetable" class="btn-secondary">
                                    <i class="fas fa-print"></i> Print
                                </button>
                                <button id="refresh-timetable" class="btn-secondary">
                                    <i class="fas fa-sync"></i> Refresh
                                </button>
                            </div>
                        </div>`;

        if (viewType === 'student') {
            html += createStudentTimetable(timetableData, editable);
        } else if (viewType === 'teacher') {
            html += createTeacherTimetable(timetableData, editable);
        } else if (viewType === 'room') {
            html += createRoomTimetable(timetableData, editable);
        }

        html += `</div>`;
        timetableResult.innerHTML = html;

        // Add event listeners for editable cells
        if (editable) {
            addEditListeners();
            setupExportPrint();
        }
    }

    // Add edit capabilities to timetable cells
    function addEditListeners() {
        document.querySelectorAll('.timetable-entry').forEach(cell => {
            cell.addEventListener('dblclick', function () {
                const assignmentId = this.getAttribute('data-assignment-id');
                if (assignmentId) {
                    openEditModal(assignmentId);
                }
            });

            cell.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                const assignmentId = this.getAttribute('data-assignment-id');
                if (assignmentId) {
                    showContextMenu(e, assignmentId);
                }
            });
        });
    }

    // Context menu for quick actions
    function showContextMenu(e, assignmentId) {
        // Remove existing context menu
        const existingMenu = document.getElementById('timetable-context-menu');
        if (existingMenu) existingMenu.remove();

        const contextMenu = document.createElement('div');
        contextMenu.id = 'timetable-context-menu';
        contextMenu.className = 'context-menu';
        contextMenu.innerHTML = `
            <ul>
                <li><a href="#" class="edit-assignment" data-id="${assignmentId}"><i class="fas fa-edit"></i> Edit</a></li>
                <li><a href="#" class="delete-assignment" data-id="${assignmentId}"><i class="fas fa-trash"></i> Delete</a></li>
                <li><a href="#" class="view-details" data-id="${assignmentId}"><i class="fas fa-info-circle"></i> View Details</a></li>
            </ul>
        `;

        contextMenu.style.position = 'fixed';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.style.zIndex = '10000';

        document.body.appendChild(contextMenu);

        // Add event listeners
        contextMenu.querySelector('.edit-assignment').addEventListener('click', function (e) {
            e.preventDefault();
            openEditModal(assignmentId);
            contextMenu.remove();
        });

        contextMenu.querySelector('.delete-assignment').addEventListener('click', function (e) {
            e.preventDefault();
            deleteAssignment(assignmentId);
            contextMenu.remove();
        });

        contextMenu.querySelector('.view-details').addEventListener('click', function (e) {
            e.preventDefault();
            viewAssignmentDetails(assignmentId);
            contextMenu.remove();
        });

        // Close context menu when clicking elsewhere
        document.addEventListener('click', function closeMenu(event) {
             if (event.target !== contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    // Update the openEditModal function
    function openEditModal(assignmentId) {
        const assignment = currentAssignments.find(a => a.id == assignmentId);
        if (!assignment) {
            showMessage('Assignment not found', 'error');
            return;
        }

        // Determine year/semester based on assignment data
        const year = generateYear.value; // Use the current selected filter for context
        const semester = generateSemester.value; // Use the current selected filter for context

        // Start creating the modal structure
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Assignment</h3>
                <p>Editing Teacher, Subject, Room, Day, and Time Slot.</p>
                <form id="edit-assignment-form">
                    <input type="hidden" name="assignment_id" value="${assignmentId}">
                    <div class="form-group">
                        <label>Teacher:</label>
                        <select name="teacher_id" id="edit-teacher-select" required>
                            <option value="${assignment.teacher_id}" selected>${assignment.teacher_name}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Subject:</label>
                        <select name="subject_id" id="edit-subject-select" required>
                            <option value="${assignment.subject_id}" selected>${assignment.subject_name}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Room:</label>
                        <select name="room_id" id="edit-room-select" required>
                            <option value="${assignment.room_id}" selected>${assignment.room_name}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Day:</label>
                        <select name="day_of_week">
                            ${CONFIG.days
                                .map(day => `<option value="${day}" ${day === assignment.day_of_week ? 'selected' : ''}>${day}</option>`)
                                .join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Time Slot:</label>
                        <select name="time_slot">
                            ${[0, 1, 2, 3, 5, 6, 7, 8]
                                .map(slot => `<option value="${slot}" ${slot == assignment.time_slot ? 'selected' : ''}>${getTimeSlotDisplay(slot)}</option>`)
                                .join('')}
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // --- NEW: Populate Select Fields using reusable logic ---
        const teacherSelect = document.getElementById('edit-teacher-select');
        const subjectSelect = document.getElementById('edit-subject-select');
        const roomSelect = document.getElementById('edit-room-select');

        // Load all options for the respective year/semester, keeping the current value selected
        loadAndPopulateDropdown(`api/get_teachers.php?year=${year}&semester=${semester}`, teacherSelect, 'Select Teacher', 'Error loading teachers')
            .then(() => teacherSelect.value = assignment.teacher_id)
            .catch(() => teacherSelect.value = assignment.teacher_id);
            
        loadAndPopulateDropdown(`api/get_subjects.php?year=${year}&semester=${semester}`, subjectSelect, 'Select Subject', 'Error loading subjects')
            .then(() => subjectSelect.value = assignment.subject_id)
            .catch(() => subjectSelect.value = assignment.subject_id);
            
        loadAndPopulateDropdown(`api/get_rooms.php?year=${year}&semester=${semester}`, roomSelect, 'Select Room', 'Error loading rooms')
            .then(() => roomSelect.value = assignment.room_id)
            .catch(() => roomSelect.value = assignment.room_id);
        // ----------------------------------------------------


        // Event listeners for modal
        modal.querySelector('#cancel-edit').addEventListener('click', () => modal.remove());
        modal.querySelector('#edit-assignment-form').addEventListener('submit', function (e) {
            e.preventDefault();
            updateAssignment(assignmentId, new FormData(this));
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
         // Display modal
        modal.style.display = 'flex';
    }

    // View assignment details
    function viewAssignmentDetails(assignmentId) {
        const assignment = currentAssignments.find(a => a.id == assignmentId);
        if (!assignment) {
            showMessage('Assignment not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Assignment Details</h3>
                <div class="assignment-details">
                    <p><strong>Teacher:</strong> ${assignment.teacher_name}</p>
                    <p><strong>Subject:</strong> ${assignment.subject_name}</p>
                    <p><strong>Room:</strong> ${assignment.room_name}</p>
                    <p><strong>Day:</strong> ${assignment.day_of_week}</p>
                    <p><strong>Time:</strong> ${getTimeSlotDisplay(assignment.time_slot)}</p>
                    <p><strong>Type:</strong> ${assignment.is_lab ? 'Lab Session' : 'Theory Class'}</p>
                    ${assignment.is_lab ? `<p><strong>Lab Batch:</strong> ${assignment.lab_batch}</p>` : ''}
                    ${assignment.is_lab ? `<p><strong>Duration:</strong> ${assignment.lab_duration} slot(s)</p>` : ''}
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-primary" id="close-details">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('#close-details').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        modal.style.display = 'flex';
    }

    // Update assignment
    function updateAssignment(assignmentId, formData) {
        const updateData = {
            assignment_id: assignmentId,
            // --- NEW FIELDS ---
            teacher_id: parseInt(formData.get('teacher_id')),
            subject_id: parseInt(formData.get('subject_id')),
            room_id: parseInt(formData.get('room_id')),
            // --- EXISTING FIELDS ---
            day_of_week: formData.get('day_of_week'),
            time_slot: parseInt(formData.get('time_slot'))
        };

        // Check if assignment is a multi-slot lab and prompt for confirmation
        const assignment = currentAssignments.find(a => a.id == assignmentId);
        if (assignment && assignment.is_lab && assignment.lab_duration > 1) {
            if (!confirm(`This is a multi-slot lab assignment (${assignment.lab_duration} slots). The update will only apply to the current slot (${getTimeSlotDisplay(assignment.time_slot)}). For full lab management, use the Lab Session Management card. Proceed with single slot update?`)) {
                return;
            }
        }

        fetch('api/update_timetable_assignment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage(data.message, 'success');
                    generateTimetableBtn.click();
                } else {
                    showMessage(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Error updating assignment', 'error');
            });
    }

    // Delete assignment
    function deleteAssignment(assignmentId) {
        if (confirm('Are you sure you want to delete this assignment? (Note: For multi-slot labs, this may only delete one slot. Use Lab Management for full deletion.)')) {
            fetch('api/delete_timetable_assignment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assignment_id: assignmentId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage(data.message, 'success');
                        // Refresh timetable
                        generateTimetableBtn.click();
                    } else {
                        showMessage(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('Error deleting assignment', 'error');
                });
        }
    }

    // Setup export and print functionality
    function setupExportPrint() {
        const exportBtn = document.getElementById('export-timetable');
        const printBtn = document.getElementById('print-timetable');
        const refreshBtn = document.getElementById('refresh-timetable');

        if (exportBtn) {
            exportBtn.addEventListener('click', showExportOptionsModal);
        }

        if (printBtn) {
            printBtn.addEventListener('click', function() {
                window.print();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                generateTimetableBtn.click();
            });
        }
    }

    // Show export options modal
    function showExportOptionsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Export Timetable</h3>
                <p>Choose your export format:</p>
                <div class="modal-actions">
                    <button id="print-pdf" class="btn-secondary">
                        <i class="fas fa-file-pdf"></i> Download PDF
                    </button>
                    <button id="export-word" class="btn-primary">
                        <i class="fas fa-file-word"></i> Export to Word
                    </button>
                    <button id="cancel-export" class="btn-danger">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for export options
        modal.querySelector('#print-pdf').addEventListener('click', function() {
            window.print();
            modal.remove();
        });

        modal.querySelector('#export-word').addEventListener('click', function() {
            exportToWord();
            modal.remove();
        });

        modal.querySelector('#cancel-export').addEventListener('click', function() {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.style.display = 'flex';
    }

    // Export timetable to Word document
    function exportToWord() {
        const year = generateYear.value;
        const semester = generateSemester.value;
        const viewTypeValue = viewType.value;
        const timetableTitle = `Timetable - Year ${year} Semester ${semester} (${viewTypeValue} View)`;

        if (!year || !semester) {
            showMessage('Please select year and semester first', 'error');
            return;
        }

        showMessage('Generating Word document...', 'info');

        const timetableData = currentAssignments;
        const viewTypeText = viewTypeValue.charAt(0).toUpperCase() + viewTypeValue.slice(1) + ' View';

        // Create Word document content
        const htmlContent = generateWordDocumentContent(timetableData, timetableTitle, viewTypeText, year, semester);

        // Create and download the Word document
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Timetable_Year${year}_Sem${semester}_${viewTypeValue}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage('Word document downloaded successfully!', 'success');
    }

    // Generate HTML content for Word document
    function generateWordDocumentContent(data, title, viewType, year, semester) {
        const days = CONFIG.days;
        const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        line-height: 1.4;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
                    .header .subtitle {
                        color: #7f8c8d;
                        font-size: 16px;
                    }
                    .timetable {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 12px;
                        table-layout: fixed;
                    }
                    .timetable th {
                        background-color: #4361ee;
                        color: white;
                        padding: 12px 8px;
                        border: 1px solid #2980b9;
                        font-weight: bold;
                    }
                    .timetable td {
                        padding: 10px 8px;
                        border: 1px solid #bdc3c7;
                        text-align: center;
                        vertical-align: top;
                        height: 80px;
                    }
                    .time-slot {
                        background-color: #f8f9fa;
                        font-weight: bold;
                        white-space: nowrap;
                    }
                    .timetable-entry {
                        background-color: #e8f5e8;
                        border: 1px solid #27ae60;
                        border-radius: 4px;
                        padding: 4px;
                        margin: 2px;
                        font-size: 9px;
                        min-height: 50px;
                    }
                    .timetable-entry.lab {
                        background-color: #fff3cd;
                        border-color: #f39c12;
                    }
                    .lunch-break {
                        background-color: #ffecb3;
                        color: #856404;
                        font-weight: bold;
                        font-style: italic;
                    }
                    .empty-slot {
                        color: #95a5a6;
                        font-style: italic;
                    }
                    .notes-section {
                        margin-top: 40px;
                        page-break-before: always;
                    }
                    .notes-section h2 {
                        color: #2c3e50;
                        border-bottom: 1px solid #bdc3c7;
                        padding-bottom: 10px;
                    }
                    .notes-content {
                        min-height: 400px;
                        border: 1px solid #bdc3c7;
                        padding: 20px;
                        margin-top: 10px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #7f8c8d;
                        font-size: 12px;
                        border-top: 1px solid #bdc3c7;
                        padding-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <div class="subtitle">
                        Generated on ${new Date().toLocaleDateString()} | ${viewType}
                    </div>
                </div>
        `;

        // Generate timetable table based on view type
        if (viewType.toLowerCase().includes('student')) {
            html += generateStudentTimetableForWord(data, days, timeSlots);
        } else if (viewType.toLowerCase().includes('teacher')) {
            html += generateTeacherTimetableForWord(data, days, timeSlots);
        } else if (viewType.toLowerCase().includes('room')) {
            html += generateRoomTimetableForWord(data, days, timeSlots);
        }

        // Add notes section
        html += `
                <div class="notes-section">
                    <h2>Notes & Additional Information</h2>
                    <div class="notes-content">
                        <p><strong>Instructions:</strong></p>
                        <p>• Use this space to write additional notes about the timetable</p>
                        <p>• Document any special scheduling requirements</p>
                        <p>• Note down room changes or teacher substitutions</p>
                        <p>• Record any important dates or events</p>
                        <br><br><br><br><br><br><br><br>
                        <p><strong>Additional Comments:</strong></p>
                        <br><br><br><br><br><br>
                    </div>
                </div>

                <div class="footer">
                    <p>Generated by Smart Time Table Scheduler | ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    // Helper functions for Word document generation
    function generateStudentTimetableForWord(data, days, timeSlots) {
    let html = '<table class="timetable">';
    
    // 1. HEADER ROW: Day + All Time Slots
    html += '<thead><tr><th class="time-slot" style="min-width: 80px;">Day</th>';
    timeSlots.forEach(slot => {
        // Explicitly set width in the header for better Word layout
        const widthStyle = (slot === 4) ? 'width: 80px;' : 'width: 100px;'; 

        if (slot !== 4) {
            html += `<th style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
        } else {
            html += `<th class="lunch-break" style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
        }
    });
    html += '</tr></thead><tbody>';

    // 2. DATA ROWS: Iterate through Days
    days.forEach(day => {
        html += `<tr>`;
        // First cell in the row is the Day (min-width matches header)
        html += `<td class="time-slot" style="min-width: 80px;">${day}</td>`;

        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];

            if (slot === 4) {
                // Lunch Break Column: No colspan, just one cell
                html += `<td class="lunch-break">LUNCH BREAK</td>`; 
                continue;
            }
            
            const entries = data.filter(item =>
                item.day_of_week === day && item.time_slot === slot
            );
            
            // CORE LOGIC 1: Check for continuation and skip cell
            const isContinuation = data.some(entry =>
                entry.day_of_week === day &&
                entry.is_lab && 
                entry.lab_duration > 1 &&
                entry.time_slot < slot && 
                (entry.time_slot + entry.lab_duration) > slot
            );

            if (isContinuation) {
                continue;
            }
            
            // CORE LOGIC 2: Check for start of multi-slot lab and apply colspan
            const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
            let colSpanValue = 1;
            
            if (isMultiSlotStart) {
                const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                colSpanValue = mainEntry.lab_duration;
                
                // Adjust the loop counter to skip the covered slots.
                i = i + colSpanValue - 1; 
            }
            
            // Start the table data cell (<td>) and apply colspan if necessary
            html += `<td ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
            
            if (entries.length > 0) {
                entries.forEach(entry => {
                    if (entry.time_slot === slot) { 
                        const labClass = entry.is_lab ? 'lab' : '';
                        const colSpanText = entry.is_lab && entry.lab_duration > 1 ? ` (${entry.lab_duration} slots)` : '';

                        html += `<div class="timetable-entry ${labClass}">
                            <strong>${entry.subject_name}</strong><br>
                            ${entry.teacher_name}<br>
                            ${entry.room_name}
                            ${entry.is_lab ? `<br>Lab: ${entry.lab_batch}${colSpanText}` : ''}
                        </div>`;
                    }
                });
            } else {
                html += `<div class="empty-slot">-</div>`;
            }
            html += `</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

    function generateTeacherTimetableForWord(data, days, timeSlots) {
    const teachers = [...new Set(data.map(item => item.teacher_id))].filter(id => id !== undefined);
    let html = '';

    teachers.forEach(teacherId => {
        const teacherData = data.filter(item => item.teacher_id === teacherId);
        const teacherName = teacherData[0]?.teacher_name || 'N/A';

        html += `<h3>Teacher: ${teacherName}</h3>`;
        html += '<table class="timetable">';
        html += '<thead><tr><th class="time-slot" style="min-width: 80px;">Day</th>';
        timeSlots.forEach(slot => {
            const widthStyle = (slot === 4) ? 'width: 80px;' : 'width: 100px;'; 
            if (slot !== 4) {
                html += `<th style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
            } else {
                html += `<th class="lunch-break" style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
            }
        });
        html += '</tr></thead><tbody>';

        days.forEach(day => {
            html += `<tr>`;
            html += `<td class="time-slot" style="min-width: 80px;">${day}</td>`;
            
            for (let i = 0; i < timeSlots.length; i++) {
                const slot = timeSlots[i];

                if (slot === 4) {
                    html += `<td class="lunch-break">LUNCH BREAK</td>`;
                    continue;
                }
                
                const entries = teacherData.filter(item =>
                    item.day_of_week === day && item.time_slot === slot
                );
                
                // CORE LOGIC 1: Check for continuation and skip cell
                const isContinuation = teacherData.some(entry =>
                    entry.day_of_week === day &&
                    entry.is_lab && 
                    entry.lab_duration > 1 &&
                    entry.time_slot < slot && 
                    (entry.time_slot + entry.lab_duration) > slot
                );

                if (isContinuation) {
                    continue;
                }

                // CORE LOGIC 2: Check for start of multi-slot lab and apply colspan
                const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
                let colSpanValue = 1;
                
                if (isMultiSlotStart) {
                    const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                    colSpanValue = mainEntry.lab_duration;
                    
                    // Adjust the loop counter to skip covered slots
                    i = i + colSpanValue - 1; 
                }
                
                html += `<td ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
                
                if (entries.length > 0) {
                    entries.forEach(entry => {
                        if (entry.time_slot === slot) { 
                            const labClass = entry.is_lab ? 'lab' : '';
                            html += `<div class="timetable-entry ${labClass}">
                                <strong>${entry.subject_name}</strong><br>
                                ${entry.room_name}
                                ${entry.is_lab ? `<br>Lab: ${entry.lab_batch}` : ''}
                            </div>`;
                        }
                    });
                } else {
                    html += `<div class="empty-slot">Free</div>`;
                }
                html += `</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table><br>';
    });
    return html;
}

    function generateRoomTimetableForWord(data, days, timeSlots) {
    const rooms = [...new Set(data.map(item => item.room_id))].filter(id => id !== undefined);
    let html = '';

    rooms.forEach(roomId => {
        const roomData = data.filter(item => item.room_id === roomId);
        const roomName = roomData[0]?.room_name || 'N/A';

        html += `<h3>Room: ${roomName}</h3>`;
        html += '<table class="timetable">';
        html += '<thead><tr><th class="time-slot" style="min-width: 80px;">Day</th>';
        timeSlots.forEach(slot => {
            const widthStyle = (slot === 4) ? 'width: 80px;' : 'width: 100px;'; 
            if (slot !== 4) {
                html += `<th style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
            } else {
                html += `<th class="lunch-break" style="${widthStyle}">${getTimeSlotDisplay(slot)}</th>`;
            }
        });
        html += '</tr></thead><tbody>';

        days.forEach(day => {
            html += `<tr>`;
            html += `<td class="time-slot" style="min-width: 80px;">${day}</td>`;
            
            for (let i = 0; i < timeSlots.length; i++) {
                const slot = timeSlots[i];

                if (slot === 4) {
                    html += `<td class="lunch-break">LUNCH BREAK</td>`;
                    continue;
                }
                
                const entries = roomData.filter(item =>
                    item.day_of_week === day && item.time_slot === slot
                );

                // CORE LOGIC 1: Check for continuation and skip cell
                const isContinuation = roomData.some(entry =>
                    entry.day_of_week === day &&
                    entry.is_lab && 
                    entry.lab_duration > 1 &&
                    entry.time_slot < slot && 
                    (entry.time_slot + entry.lab_duration) > slot
                );

                if (isContinuation) {
                    continue;
                }

                // CORE LOGIC 2: Check for start of multi-slot lab and apply colspan
                const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
                let colSpanValue = 1;
                
                if (isMultiSlotStart) {
                    const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                    colSpanValue = mainEntry.lab_duration;
                    
                    // Adjust the loop counter to skip covered slots
                    i = i + colSpanValue - 1; 
                }
                
                html += `<td ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
                
                if (entries.length > 0) {
                    entries.forEach(entry => {
                        if (entry.time_slot === slot) { 
                            const labClass = entry.is_lab ? 'lab' : '';
                            html += `<div class="timetable-entry ${labClass}">
                                <strong>${entry.subject_name}</strong><br>
                                ${entry.teacher_name}
                                ${entry.is_lab ? `<br>Lab: ${entry.lab_batch}` : ''}
                            </div>`;
                        }
                    });
                } else {
                    html += `<div class="empty-slot">Available</div>`;
                }
                html += `</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table><br>';
    });
    return html;
}
    // Function to show messages
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <button class="close-message">&times;</button>
        `;

        document.body.appendChild(messageDiv);

        // Add close functionality
        messageDiv.querySelector('.close-message').addEventListener('click', function() {
            messageDiv.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Helper function for time slot display
    function getTimeSlotDisplay(timeSlot) {
        return CONFIG.timeSlots[timeSlot] || 'Unknown Time';
    }

    // Add this function to calculate optimal column widths
function calculateOptimalColumnWidths() {
    const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const days = CONFIG.days;
    
    // Calculate available width (subtract day column and some padding)
    const availableWidth = window.innerWidth - 150; // 150px for day column
    const columnWidth = Math.max(100, availableWidth / timeSlots.length);
    
    // Apply calculated widths
    const timetable = document.querySelector('.timetable');
    if (timetable) {
        const headers = timetable.querySelectorAll('th:not(:first-child)');
        const cells = timetable.querySelectorAll('td:not(:first-child)');
        
        headers.forEach(header => {
            header.style.minWidth = `${columnWidth}px`;
            header.style.maxWidth = `${columnWidth}px`;
        });
        
        cells.forEach(cell => {
            cell.style.minWidth = `${columnWidth}px`;
            cell.style.maxWidth = `${columnWidth}px`;
        });
    }
}

// Call this function after generating timetable
function displayTimetable(timetableData, viewType, editable = false) {
    console.log('Displaying timetable with data:', timetableData);
    
    if (!timetableData || timetableData.length === 0) {
        timetableResult.innerHTML = `
            <div class="no-timetable-message">
                <p>No timetable assignments found for the selected year and semester.</p>
                <p>Use the "Manual Timetable Assignment" or "Lab Session Management" cards above to create your timetable.</p>
            </div>`;
        return;
    }

    let html = `<div class="timetable-container">
                    <div class="timetable-header">
                        <h3>Timetable - ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View</h3>
                        <div>
                            <button id="export-timetable" class="btn-secondary">
                                <i class="fas fa-download"></i> Export
                            </button>
                            <button id="print-timetable" class="btn-secondary">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button id="refresh-timetable" class="btn-secondary">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    </div>`;

    if (viewType === 'student') {
        html += createStudentTimetable(timetableData, editable);
    } else if (viewType === 'teacher') {
        html += createTeacherTimetable(timetableData, editable);
    } else if (viewType === 'room') {
        html += createRoomTimetable(timetableData, editable);
    }

    html += `</div>`;
    timetableResult.innerHTML = html;

    // Calculate and apply optimal column widths
    setTimeout(() => {
        calculateOptimalColumnWidths();
    }, 100);

    // Add event listeners for editable cells
    if (editable) {
        addEditListeners();
        setupExportPrint();
    }
}

// Add resize listener to adjust column widths when window resizes
window.addEventListener('resize', function() {
    if (document.querySelector('.timetable')) {
        calculateOptimalColumnWidths();
    }
});



    // In your dashboard.js file, update the timetable creation functions:

  function createStudentTimetable(data, editable) {
    const days = CONFIG.days; // ['Monday', 'Tuesday', 'Wednesday', ...]
    const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // [10:00, 10:50, ..., 4:40-5:00]

    let html = '<div class="timetable-scroll-container">';
    html += '<table class="timetable">';

    // 1. HEADER ROW: Day + All Time Slots
    html += '<thead><tr><th class="time-header">Day</th>';
    timeSlots.forEach(slot => {
        if (slot !== 4) {
            html += `<th>${getTimeSlotDisplay(slot)}</th>`;
        } else {
            html += `<th class="lunch-time">${getTimeSlotDisplay(slot)}</th>`;
        }
    });
    html += '</tr></thead><tbody>';

    // 2. DATA ROWS: Iterate through Days
    days.forEach(day => {
        html += `<tr>`;
        // First cell in the row is the Day
        html += `<td class="time-slot">${day}</td>`;

        // Inner loop iterates through Time Slots (columns) using a standard for loop for index control
        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];

            if (slot === 4) {
                // Lunch break column - always a single cell here
                html += `<td class="lunch-break-cell">LUNCH BREAK</td>`;
                continue; // Move to the next slot (slot 5)
            }

            const entries = data.filter(item =>
                item.day_of_week === day && item.time_slot === slot
            );
            
            // --- Logic to check for continuation and skip cell ---
            // Check if this slot is covered by a lab that started earlier
            const isContinuation = data.some(entry =>
                entry.day_of_week === day &&
                entry.is_lab && 
                entry.lab_duration > 1 &&
                entry.time_slot < slot && // Started before current slot
                (entry.time_slot + entry.lab_duration) > slot // And covers current slot
            );

            // CORE LOGIC 1: Skip continuation slots (already covered by colspan)
            if (isContinuation) {
                continue;
            }
            // ----------------------------------------------------
            
            // --- Logic to check for start of multi-slot lab and apply colspan ---
            const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
            let colSpanValue = 1;
            
            if (isMultiSlotStart) {
                const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                colSpanValue = mainEntry.lab_duration;
                
                // CORE LOGIC 2: Adjust the loop counter to skip the covered slots.
                // We increment 'i' by (colSpanValue - 1) because the 'i++' at the end 
                // of the loop will handle the last slot covered by the colspan.
                i = i + colSpanValue - 1; 
            }
            
            // Start the table data cell (<td>) and apply colspan if necessary
            html += `<td class="timetable-cell" ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
            
            if (entries.length > 0) {
                entries.forEach(entry => {
                    // Only render content if it is the intended start slot
                    if (entry.time_slot === slot) { 
                        const labClass = entry.is_lab ? 'lab-session' : 'theory-session';
                        const colSpanText = entry.is_lab && entry.lab_duration > 1 ? ` (${entry.lab_duration} slots)` : '';

                        html += `<div class="timetable-entry ${labClass}" 
                                     data-assignment-id="${entry.id}">
                            <strong>${entry.subject_name}</strong><br>
                            ${entry.teacher_name}<br>
                            ${entry.room_name}
                            ${entry.is_lab ? `<br><small>Lab - ${entry.lab_batch}${colSpanText}</small>` : ''}
                        </div>`;
                    }
                });
            } else {
                html += `<div class="empty-slot">Available</div>`;
            }
            html += `</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}
// Similarly update createTeacherTimetable and createRoomTimetable functions
// to follow the same structure with days as columns and time slots as rows

function createTeacherTimetable(data, editable) {
    const teachers = [...new Set(data.map(item => item.teacher_id))].filter(id => id !== undefined);
    const days = CONFIG.days;
    const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    let html = '';
    teachers.forEach(teacherId => {
        const teacherData = data.filter(item => item.teacher_id === teacherId);
        const teacherName = teacherData[0]?.teacher_name || 'N/A';

        html += `<div class="teacher-timetable">
            <h4>${teacherName}</h4>
            <div class="timetable-scroll-container">
            <table class="timetable">
                <thead><tr><th class="time-header">Day</th>`;
        timeSlots.forEach(slot => {
            if (slot !== 4) {
                html += `<th>${getTimeSlotDisplay(slot)}</th>`;
            } else {
                html += `<th class="lunch-time">${getTimeSlotDisplay(slot)}</th>`;
            }
        });
        html += '</tr></thead><tbody>';

        days.forEach(day => {
            html += `<tr>`;
            html += `<td class="time-slot">${day}</td>`;
            
            for (let i = 0; i < timeSlots.length; i++) {
                const slot = timeSlots[i];

                if (slot === 4) {
                    html += `<td class="lunch-break-cell">LUNCH BREAK</td>`;
                    continue;
                }
                
                const entries = teacherData.filter(item =>
                    item.day_of_week === day && item.time_slot === slot
                );
                
                // Check if this slot is a continuation of a previously started multi-slot lab
                const isContinuation = teacherData.some(entry =>
                    entry.day_of_week === day &&
                    entry.is_lab && 
                    entry.lab_duration > 1 &&
                    entry.time_slot < slot && 
                    (entry.time_slot + entry.lab_duration) > slot
                );

                if (isContinuation) {
                    continue;
                }

                // Check if this slot is the START of a multi-slot lab
                const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
                let colSpanValue = 1;
                
                if (isMultiSlotStart) {
                    const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                    colSpanValue = mainEntry.lab_duration;
                    
                    // Adjust the loop counter to skip covered slots
                    i = i + colSpanValue - 1; 
                }
                
                html += `<td class="timetable-cell" ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
                
                if (entries.length > 0) {
                    entries.forEach(entry => {
                        if (entry.time_slot === slot) { 
                            const labClass = entry.is_lab ? 'lab-session' : 'theory-session';
                            html += `<div class="timetable-entry ${labClass}" data-assignment-id="${entry.id}">
                                <strong>${entry.subject_name}</strong><br>
                                ${entry.room_name}
                                ${entry.is_lab ? `<br><small>Lab - ${entry.lab_batch}</small>` : ''}
                            </div>`;
                        }
                    });
                } else {
                    html += `<div class="empty-slot">Free</div>`;
                }
                html += `</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';
    });
    return html;
}

function createRoomTimetable(data, editable) {
    const rooms = [...new Set(data.map(item => item.room_id))].filter(id => id !== undefined);
    const days = CONFIG.days;
    const timeSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    let html = '';
    rooms.forEach(roomId => {
        const roomData = data.filter(item => item.room_id === roomId);
        const roomName = roomData[0]?.room_name || 'N/A';

        html += `<div class="room-timetable">
            <h4>${roomName}</h4>
            <div class="timetable-scroll-container">
            <table class="timetable">
                <thead><tr><th class="time-header">Day</th>`;
        timeSlots.forEach(slot => {
            if (slot !== 4) {
                html += `<th>${getTimeSlotDisplay(slot)}</th>`;
            } else {
                html += `<th class="lunch-time">${getTimeSlotDisplay(slot)}</th>`;
            }
        });
        html += '</tr></thead><tbody>';

        days.forEach(day => {
            html += `<tr>`;
            html += `<td class="time-slot">${day}</td>`;
            
            for (let i = 0; i < timeSlots.length; i++) {
                const slot = timeSlots[i];

                if (slot === 4) {
                    html += `<td class="lunch-break-cell">LUNCH BREAK</td>`;
                    continue;
                }
                
                const entries = roomData.filter(item =>
                    item.day_of_week === day && item.time_slot === slot
                );

                const isContinuation = roomData.some(entry =>
                    entry.day_of_week === day &&
                    entry.is_lab && 
                    entry.lab_duration > 1 &&
                    entry.time_slot < slot && 
                    (entry.time_slot + entry.lab_duration) > slot
                );

                if (isContinuation) {
                    continue;
                }

                const isMultiSlotStart = entries.some(entry => entry.is_lab && entry.lab_duration > 1);
                let colSpanValue = 1;
                
                if (isMultiSlotStart) {
                    const mainEntry = entries.find(entry => entry.is_lab && entry.lab_duration > 1);
                    colSpanValue = mainEntry.lab_duration;
                    
                    // Adjust the loop counter to skip covered slots
                    i = i + colSpanValue - 1; 
                }
                
                html += `<td class="timetable-cell" ${colSpanValue > 1 ? `colspan="${colSpanValue}"` : ''}>`;
                
                if (entries.length > 0) {
                    entries.forEach(entry => {
                        if (entry.time_slot === slot) { 
                            const labClass = entry.is_lab ? 'lab-session' : 'theory-session';
                            html += `<div class="timetable-entry ${labClass}" data-assignment-id="${entry.id}">
                                <strong>${entry.subject_name}</strong><br>
                                ${entry.teacher_name}
                                ${entry.is_lab ? `<br><small>Lab - ${entry.lab_batch}</small>` : ''}
                            </div>`;
                        }
                    });
                } else {
                    html += `<div class="empty-slot">Available</div>`;
                }
                html += `</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';
    });
    return html;
}
    // Initialize the dashboard
    function initializeDashboard() {
        // Set current year as default
        const currentYear = new Date().getFullYear();
        if(generateYear.querySelector(`option[value="${currentYear}"]`)){
            generateYear.value = currentYear;
            assignYear.value = currentYear;
            labYear.value = currentYear;
        }

        // Show welcome message
        setTimeout(() => {
            showMessage('Welcome to Timetable Management System!', 'success');
        }, 1000);
    }

    // Initialize dashboard when DOM is loaded
    initializeDashboard();
});