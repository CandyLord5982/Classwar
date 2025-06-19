<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏆 Secure Leaderboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status { padding: 15px 30px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        
        /* Login Screen */
        .login-screen { padding: 50px 30px; text-align: center; background: #f8f9fa; }
        .login-form { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .role-selector { display: flex; gap: 10px; margin-bottom: 30px; }
        .role-tab { flex: 1; padding: 12px; border: 2px solid #ddd; background: #f8f9fa; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .role-tab.active { border-color: #667eea; background: #667eea; color: white; }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; }
        .form-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
        .form-input:focus { outline: none; border-color: #667eea; }
        .login-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; transition: transform 0.3s; }
        .login-btn:hover { transform: translateY(-2px); }
        .login-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .error-message { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-top: 15px; text-align: center; }
        .success-message { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-top: 15px; text-align: center; }
        
        /* Main Game Interface */
        .main-content { display: flex; min-height: 500px; }
        .leaderboard { flex: 2; padding: 30px; }
        .controls { flex: 1; background: #f8f9fa; padding: 30px; border-left: 1px solid #eee; }
        .leaderboard h2 { color: #333; margin-bottom: 20px; text-align: center; }
        .leaderboard-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .leaderboard-item:hover { transform: translateX(5px); }
        .rank { font-size: 24px; font-weight: bold; color: #667eea; margin-right: 20px; min-width: 40px; }
        .rank.first { color: #ffd700; }
        .rank.second { color: #c0c0c0; }
        .rank.third { color: #cd7f32; }
        .student-info { flex: 1; }
        .student-name { font-size: 18px; font-weight: bold; color: #333; }
        .student-username { font-size: 14px; color: #666; }
        .interactions { font-size: 14px; color: #666; margin-top: 5px; }
        .score { font-size: 24px; font-weight: bold; color: #28a745; }
        .controls h3 { color: #333; margin-bottom: 20px; }
        .control-group { margin-bottom: 25px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .control-group h4 { margin-bottom: 15px; color: #667eea; }
        .add-score-btn { width: 100%; padding: 15px; font-size: 18px; background: #28a745; color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; }
        .add-score-btn:hover:not(:disabled) { background: #218838; transform: translateY(-2px); }
        .add-score-btn:disabled { background: #6c757d; cursor: not-allowed; }
        .teacher-controls button { width: 100%; padding: 12px; margin-bottom: 10px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s; }
        .reset-btn { background: #dc3545; color: white; }
        .toggle-btn { background: #17a2b8; color: white; }
        .add-student-btn { background: #28a745; color: white; }
        .teacher-controls button:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
        .student-list { max-height: 250px; overflow-y: auto; }
        .student-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; background: #f8f9fa; border-radius: 5px; }
        .student-online { border-left: 3px solid #28a745; }
        .student-offline { border-left: 3px solid #dc3545; }
        .limit-input { width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; text-align: center; }
        .set-limit-btn { padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: #28a745; color: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transform: translateX(400px); transition: transform 0.3s; z-index: 1000; }
        .notification.show { transform: translateX(0); }
        .notification.error { background: #dc3545; }
        .game-inactive { opacity: 0.6; pointer-events: none; }
        .hidden { display: none; }
        .user-info { background: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .logout-btn { background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; float: right; }
        input[type="text"], input[type="password"], input[type="number"] { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
        
        /* Add Student Modal */
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; }
        .modal h3 { margin-bottom: 20px; color: #333; }
        .modal-buttons { display: flex; gap: 10px; margin-top: 20px; }
        .modal-buttons button { flex: 1; padding: 10px; border: none; border-radius: 5px; cursor: pointer; }
        .cancel-btn { background: #6c757d; color: white; }
        .confirm-btn { background: #28a745; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Secure Leaderboard</h1>
            <p>Login required to participate</p>
        </div>

        <div class="status">
            <span id="connectionStatus">Connecting...</span>
            <span id="gameStatus">Game Active</span>
        </div>

        <!-- Login Screen -->
        <div id="loginScreen" class="login-screen">
            <div class="login-form">
                <h2>Login to Continue</h2>
                <div class="role-selector">
                    <div class="role-tab active" data-role="student">👨‍🎓 Student</div>
                    <div class="role-tab" data-role="teacher">👨‍🏫 Teacher</div>
                </div>
                
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" class="form-input" placeholder="Enter your username" autocomplete="username">
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" class="form-input" placeholder="Enter your password" autocomplete="current-password">
                </div>
                
                <button id="loginBtn" class="login-btn">🔓 Login</button>
                
                <div id="loginMessage"></div>
                
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: left;">
                    <h4>Demo Accounts:</h4>
                    <p><strong>Teacher:</strong> teacher123 / teach2024</p>
                    <p><strong>Students:</strong></p>
                    <small>student1 / pass1 (Alice Johnson)<br>
                    student2 / pass2 (Bob Wilson)<br>
                    student3 / pass3 (Carol Davis)</small>
                </div>
            </div>
        </div>

        <!-- Main Game Interface -->
        <div id="gameInterface" class="main-content hidden">
            <div class="leaderboard">
                <h2>🏆 Leaderboard</h2>
                <div id="leaderboardList">
                    <p style="text-align: center; color: #666;">No students online yet</p>
                </div>
            </div>

            <div class="controls">
                <div class="user-info">
                    <strong id="currentUser"></strong>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                    <div style="clear: both;"></div>
                </div>
                
                <!-- Student Controls -->
                <div id="studentControls" class="hidden">
                    <h3>Student Actions</h3>
                    <div class="control-group">
                        <h4>Add Score</h4>
                        <p id="interactionsLeft">Interactions remaining: 5</p>
                        <button id="addScoreBtn" class="add-score-btn" onclick="addScore()">
                            ⭐ Add 1 Point
                        </button>
                    </div>
                </div>

                <!-- Teacher Controls -->
                <div id="teacherControls" class="hidden">
                    <h3>Teacher Controls</h3>
                    
                    <div class="control-group">
                        <h4>Game Management</h4>
                        <button class="toggle-btn" onclick="toggleGame()">
                            <span id="toggleText">⏸️ Pause Game</span>
                        </button>
                        <button class="reset-btn" onclick="resetGame()">
                            🔄 Reset All Scores
                        </button>
                        <button class="add-student-btn" onclick="showAddStudentModal()">
                            👨‍🎓 Add Student Account
                        </button>
                    </div>

                    <div class="control-group">
                        <h4>Manage Students</h4>
                        <div id="studentList" class="student-list">
                            <p style="color: #666;">Loading students...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Student Modal -->
    <div id="addStudentModal" class="modal hidden">
        <div class="modal-content">
            <h3>Add New Student Account</h3>
            <div class="form-group">
                <label>Username:</label>
                <input type="text" id="newUsername" placeholder="e.g., john123">
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="newPassword" placeholder="Student's password">
            </div>
            <div class="form-group">
                <label>Full Name:</label>
                <input type="text" id="newStudentName" placeholder="e.g., John Smith">
            </div>
            <div class="modal-buttons">
                <button class="cancel-btn" onclick="hideAddStudentModal()">Cancel</button>
                <button class="confirm-btn" onclick="addStudentAccount()">Add Student</button>
            </div>
        </div>
    </div>

    <!-- Notification -->
    <div id="notification" class="notification"></div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let currentRole = null;
        let currentUser = null;
        let selectedRole = 'student';

        // DOM elements
        const loginScreen = document.getElementById('loginScreen');
        const gameInterface = document.getElementById('gameInterface');
        const connectionStatus = document.getElementById('connectionStatus');
        const gameStatus = document.getElementById('gameStatus');
        const leaderboardList = document.getElementById('leaderboardList');
        const studentControls = document.getElementById('studentControls');
        const teacherControls = document.getElementById('teacherControls');
        const addScoreBtn = document.getElementById('addScoreBtn');
        const interactionsLeft = document.getElementById('interactionsLeft');
        const studentList = document.getElementById('studentList');
        const toggleText = document.getElementById('toggleText');
        const notification = document.getElementById('notification');
        const currentUserDisplay = document.getElementById('currentUser');
        const loginMessage = document.getElementById('loginMessage');

        // Role selector
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                selectedRole = tab.dataset.role;
            });
        });

        // Login form
        document.getElementById('loginBtn').addEventListener('click', login);
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });

        // Socket events
        socket.on('connect', () => {
            connectionStatus.textContent = '✅ Connected';
            connectionStatus.style.color = '#28a745';
        });

        socket.on('disconnect', () => {
            connectionStatus.textContent = '❌ Disconnected';
            connectionStatus.style.color = '#dc3545';
        });

        socket.on('login_success', (data) => {
            console.log('Login successful:', data);
            currentRole = data.role;
            currentUser = data.username;
            
            loginScreen.classList.add('hidden');
            gameInterface.classList.remove('hidden');
            
            currentUserDisplay.textContent = `${data.name} (${data.username})`;
            
            if (data.role === 'teacher') {
                teacherControls.classList.remove('hidden');
                socket.emit('get_student_accounts');
            } else {
                studentControls.classList.remove('hidden');
            }
            
            showNotification(`Welcome, ${data.name}!`);
            showLoginMessage('Login successful!', 'success');
        });

        socket.on('login_error', (message) => {
            console.log('Login error:', message);
            showLoginMessage(message, 'error');
        });

        socket.on('game_state', (state) => {
            updateLeaderboard(state.leaderboard);
            updateGameStatus(state.gameActive);
            
            if (currentRole === 'student') {
                updateStudentInteractions(state.students);
            }
        });

        socket.on('student_accounts', (accounts) => {
            updateStudentAccountsList(accounts);
        });

        socket.on('score_added', (data) => {
            showNotification(`${data.studentName} added ${data.points} points! New score: ${data.newScore}`);
        });

        socket.on('game_reset', (message) => {
            showNotification(message, 'info');
        });

        socket.on('game_status_changed', (data) => {
            showNotification(data.message, 'info');
        });

        socket.on('student_added', (data) => {
            showNotification(`Student account created: ${data.username} (${data.name})`);
            socket.emit('get_student_accounts');
        });

        socket.on('error', (message) => {
            showNotification(message, 'error');
        });

        // Functions
        function login() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            console.log('Attempting login:', username, selectedRole);
            
            if (!username || !password) {
                showLoginMessage('Please enter both username and password', 'error');
                return;
            }
            
            document.getElementById('loginBtn').disabled = true;
            showLoginMessage('Logging in...', 'info');
            
            socket.emit('login', { username, password, role: selectedRole });
        }

        function logout() {
            location.reload();
        }

        function addScore() {
            socket.emit('add_score', { points: 1 });
        }

        function resetGame() {
            if (confirm('Are you sure you want to reset all scores?')) {
                socket.emit('reset_game');
            }
        }

        function toggleGame() {
            socket.emit('toggle_game');
        }

        function setStudentLimit(studentId, limit) {
            socket.emit('set_interaction_limit', { studentId, limit: parseInt(limit) });
        }

        function showAddStudentModal() {
            document.getElementById('addStudentModal').classList.remove('hidden');
        }

        function hideAddStudentModal() {
            document.getElementById('addStudentModal').classList.add('hidden');
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('newStudentName').value = '';
        }

        function addStudentAccount() {
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const name = document.getElementById('newStudentName').value.trim();
            
            if (!username || !password || !name) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            socket.emit('add_student_account', { username, password, name });
            hideAddStudentModal();
        }

        function updateLeaderboard(leaderboard) {
            if (leaderboard.length === 0) {
                leaderboardList.innerHTML = '<p style="text-align: center; color: #666;">No students online yet</p>';
                return;
            }

            leaderboardList.innerHTML = leaderboard.map(student => `
                <div class="leaderboard-item">
                    <div class="rank ${student.rank === 1 ? 'first' : student.rank === 2 ? 'second' : student.rank === 3 ? 'third' : ''}">
                        #${student.rank}
                    </div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-username">@${student.username}</div>
                        <div class="interactions">${student.interactions}/${student.maxInteractions} interactions used</div>
                    </div>
                    <div class="score">${student.score}</div>
                </div>
            `).join('');
        }

        function updateGameStatus(active) {
            gameStatus.textContent = active ? '🟢 Game Active' : '🔴 Game Paused';
            gameStatus.style.color = active ? '#28a745' : '#dc3545';
            
            if (!active) {
                gameInterface.classList.add('game-inactive');
            } else {
                gameInterface.classList.remove('game-inactive');
            }
            
            toggleText.textContent = active ? '⏸️ Pause Game' : '▶️ Resume Game';
        }

        function updateStudentAccountsList(accounts) {
            if (accounts.length === 0) {
                studentList.innerHTML = '<p style="color: #666;">No student accounts yet</p>';
                return;
            }

            studentList.innerHTML = accounts.map(account => `
                <div class="student-item ${account.isOnline ? 'student-online' : 'student-offline'}">
                    <div>
                        <strong>${account.name}</strong><br>
                        <small>@${account.username} ${account.isOnline ? '🟢 Online' : '🔴 Offline'}</small>
                    </div>
                    ${account.isOnline ? `
                        <div>
                            <input type="number" class="limit-input" value="5" 
                                   id="limit-${account.username}" min="0" max="50">
                            <button class="set-limit-btn" onclick="setStudentLimitByUsername('${account.username}')">
                                Set
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        function setStudentLimitByUsername(username) {
            // Find the student's socket ID
            const limit = document.getElementById(`limit-${username}`).value;
            // Note: This is a simplified version. In a real app, you'd need to track socket IDs by username
            showNotification('Feature coming soon: Set limits by username', 'info');
        }

        function updateStudentInteractions(students) {
            const myData = students.find(([id, student]) => id === socket.id);
            if (myData) {
                const [id, student] = myData;
                const remaining = student.maxInteractions - student.interactions;
                interactionsLeft.textContent = `Interactions remaining: ${remaining}`;
                addScoreBtn.disabled = remaining <= 0;
                
                if (remaining <= 0) {
                    addScoreBtn.textContent = '❌ No interactions left';
                } else {
                    addScoreBtn.textContent = '⭐ Add 1 Point';
                }
            }
        }

        function showNotification(message, type = 'success') {
            notification.textContent = message;
            notification.className = 'notification';
            if (type === 'error') notification.classList.add('error');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function showLoginMessage(message, type) {
            loginMessage.className = type === 'error' ? 'error-message' : 'success-message';
            loginMessage.textContent = message;
            document.getElementById('loginBtn').disabled = false;
            
            setTimeout(() => {
                loginMessage.textContent = '';
                loginMessage.className = '';
            }, 5000);
        }
    </script>
</body>
</html>
