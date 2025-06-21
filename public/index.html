<!DOCTYPE html>
<html>
<head>
    <title>🏆 Simple Leaderboard</title>
    <style>
        body { font-family: Arial; background: #667eea; padding: 20px; margin: 0; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; }
        .status { padding: 15px; background: #f0f0f0; display: flex; justify-content: space-between; font-weight: bold; }
        .main { display: flex; min-height: 400px; }
        .leaderboard { flex: 2; padding: 30px; }
        .controls { flex: 1; background: #f8f9fa; padding: 30px; }
        .activity-feed { 
            flex: 1; 
            background: #fff; 
            padding: 20px; 
            border-left: 2px solid #e9ecef; 
            max-height: 600px; 
            overflow-y: auto; 
        }
        .login-form { padding: 50px; text-align: center; }
        .role-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .role-tab { flex: 1; padding: 15px; border: 2px solid #ddd; border-radius: 5px; cursor: pointer; transition: all 0.3s; }
        .role-tab.active { border-color: #667eea; background: #667eea; color: white; }
        input { width: 100%; padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
        button { padding: 15px 30px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; transition: all 0.3s; }
        .login-btn { background: #667eea; color: white; width: 100%; }
        .score-btn { background: #28a745; color: white; width: 100%; font-size: 20px; }
        .teacher-btn { background: #17a2b8; color: white; width: 100%; }
        .reset-btn { background: #dc3545; color: white; width: 100%; }
        button:hover { transform: translateY(-2px); }
        button:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .risky-btn { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; width: 100%; font-size: 18px; margin-top: 10px; }
        .powerup-section { margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; border: 1px solid #ffeaa7; }
        .powerup-btn { background: #6c5ce7; color: white; padding: 8px 12px; margin: 5px; font-size: 12px; }
        .target-btn { background: #e74c3c; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; }
        .target-btn:hover { background: #c0392b; }
        .target-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; background: white; border-radius: 3px; border: 1px solid #ddd; }
        .credits-display { background: #ff6b35; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; font-weight: bold; }
        .currency-display { display: flex; justify-content: space-between; margin: 10px 0; }
        .currency-item { background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center; flex: 1; margin: 0 5px; }
        .student-item { display: flex; align-items: center; padding: 20px; margin: 10px 0; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .rank { font-size: 24px; font-weight: bold; color: #667eea; margin-right: 20px; min-width: 50px; }
        .rank.first { color: #ffd700; }
        .rank.second { color: #c0c0c0; }
        .rank.third { color: #cd7f32; }
        .student-info { flex: 1; }
        .student-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .student-stats { font-size: 14px; color: #666; }
        .interactions { font-size: 14px; color: #666; }
        .score { font-size: 24px; font-weight: bold; color: #28a745; }
        .credits { font-size: 16px; font-weight: bold; color: #ff6b35; margin-left: 10px; }
        .online-students { margin-top: 20px; }
        .online-student { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: #e9ecef; border-radius: 5px; }
        .limit-control { display: flex; align-items: center; gap: 10px; }
        .limit-input { width: 60px; padding: 5px; }
        .set-btn { padding: 5px 10px; background: #667eea; color: white; font-size: 12px; }
        .hidden { display: none; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
        
        .activity-item { 
            padding: 10px; 
            margin: 5px 0; 
            border-radius: 5px; 
            font-size: 14px; 
            animation: slideIn 0.3s ease-out; 
        }
        .activity-safe { background: #d4edda; color: #155724; }
        .activity-risky { background: #fff3cd; color: #856404; }
        .activity-steal { background: #f8d7da; color: #721c24; }
        .activity-powerup { background: #e2e3f1; color: #383d41; }
        .activity-shield { background: #cce7ff; color: #004085; }
        .activity-system { background: #f8f9fa; color: #6c757d; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Simple Leaderboard</h1>
            <p>Real-time classroom competition</p>
        </div>

        <div class="status">
            <span id="status">Connecting...</span>
            <span id="gameStatus">Game Active</span>
        </div>

        <!-- Login Screen -->
        <div id="loginScreen" class="login-form">
            <h2>Login to Join</h2>
            
            <div class="role-tabs">
                <div class="role-tab active" data-role="student">👨‍🎓 Student</div>
                <div class="role-tab" data-role="teacher">👨‍🏫 Teacher</div>
            </div>
            
            <input type="text" id="username" placeholder="Username">
            <input type="password" id="password" placeholder="Password">
            <button class="login-btn" onclick="login()">Login</button>
            
            <div id="loginMessage"></div>
            
            <div style="margin-top: 30px; text-align: left; background: #f0f0f0; padding: 20px; border-radius: 5px;">
                <h4>Test Accounts:</h4>
                <p><strong>Teacher:</strong> teacher123 / teach2024</p>
                <p><strong>Students:</strong> student1/pass1, student2/pass2, student3/pass3</p>
            </div>
        </div>

        <!-- Main Game -->
        <div id="gameInterface" class="main hidden">
            <div class="leaderboard">
                <h2>🏆 Leaderboard</h2>
                <div id="leaderboardList">
                    <p style="text-align: center; color: #666; padding: 40px;">No students online yet</p>
                </div>
            </div>

            <div class="controls">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong id="currentUser">User</strong>
                    <button style="float: right; padding: 5px 10px; background: #6c757d; color: white;" onclick="logout()">Logout</button>
                    <div style="clear: both;"></div>
                </div>
                
                <!-- Student Controls -->
                <div id="studentControls" class="hidden">
                    <h3>Your Progress</h3>
                    
                    <div class="currency-display">
                        <div class="currency-item">
                            <strong id="interactionsLeft">5</strong><br>
                            <small>Interactions</small>
                        </div>
                        <div class="currency-item">
                            <strong id="creditsDisplay">10</strong><br>
                            <small>💰 Credits</small>
                        </div>
                    </div>
                    
                    <button id="scoreBtn" class="score-btn" onclick="addScore()">⭐ Safe +1 Point<br><small>+1 Credit</small></button>
                    <button id="riskyBtn" class="risky-btn" onclick="riskyScore()">🎲 Risky -1 to +3 Points<br><small>+2 Credits</small></button>
                    
                    <div class="powerup-section">
                        <h4>💪 Power-ups Shop</h4>
                        <button class="powerup-btn" onclick="showStealTargets()" style="background: #e74c3c;">🔪 Steal Points (8💰)</button>
                        <button class="powerup-btn" onclick="buyPowerup('double_next')" style="background: #f39c12;">⚡ Double Next (6💰)</button>
                        <button class="powerup-btn" onclick="buyPowerup('shield')" style="background: #27ae60;">🛡️ Shield (10💰)</button>
                        <button class="powerup-btn" onclick="buyPowerup('random_bonus')" style="background: #9b59b6;">🎁 Random Bonus (5💰)</button>
                        
                        <div id="stealTargets" class="hidden" style="margin-top: 15px; padding: 15px; background: #ffe6e6; border-radius: 5px; border: 2px solid #e74c3c;">
                            <h5>🔪 Choose Target to Steal From:</h5>
                            <div id="targetList">Loading...</div>
                            <button onclick="hideStealTargets()" style="margin-top: 10px; padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 3px;">Cancel</button>
                        </div>
                        
                        <div id="activeEffects" style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px; font-size: 12px;">
                            <strong>Active Effects:</strong><br>
                            <span id="effectsList">None</span>
                        </div>
                    </div>
                </div>

                <!-- Teacher Controls -->
                <div id="teacherControls" class="hidden">
                    <h3>Teacher Controls</h3>
                    <button class="teacher-btn" onclick="toggleGame()">
                        <span id="toggleText">⏸️ Pause Game</span>
                    </button>
                    <button class="reset-btn" onclick="resetScores()">🔄 Reset All Scores</button>
                    
                    <div class="online-students">
                        <h4>Online Students:</h4>
                        <div id="onlineStudents">No students online</div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                            <h4>💰 Credit Management</h4>
                            <div id="creditControls">Select a student to manage credits</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="activity-feed">
                <h3>📢 Live Activity</h3>
                <div id="activityList">
                    <p style="text-align: center; color: #666;">Activity will appear here...</p>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        // Activity functions FIRST (before anything else)
        let activities = [];

        function addActivity(type, message, timestamp = new Date()) {
            const activity = {
                type,
                message,
                timestamp: timestamp.toLocaleTimeString(),
                id: Date.now()
            };
            
            activities.unshift(activity); // Add to beginning
            if (activities.length > 50) activities.pop(); // Keep only last 50
            
            updateActivityFeed();
        }

        function updateActivityFeed() {
            const feed = document.getElementById('activityList');
            
            if (activities.length === 0) {
                feed.innerHTML = '<p style="text-align: center; color: #666;">Activity will appear here...</p>';
                return;
            }
            
            feed.innerHTML = activities.map(activity => `
                <div class="activity-item activity-${activity.type}">
                    <strong>${activity.timestamp}</strong> - ${activity.message}
                </div>
            `).join('');
        }

        // Initialize socket and variables
        const socket = io();
        let selectedRole = 'student';
        let currentRole = null;
        let allStudents = [];

        // Role selection
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                selectedRole = tab.dataset.role;
            };
        });

        // Socket events
        socket.on('connect', () => {
            document.getElementById('status').textContent = '✅ Connected';
            addActivity('system', '🔗 Connected to server');
        });

        socket.on('activity_update', (data) => {
            addActivity(data.type, data.message);
        });

        socket.on('login_success', (data) => {
            currentRole = data.role;
            window.myUsername = data.username; // Store our username
            document.getElementById('currentUser').textContent = data.name;
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('gameInterface').classList.remove('hidden');
            
            if (data.role === 'teacher') {
                document.getElementById('teacherControls').classList.remove('hidden');
                addActivity('system', `👨‍🏫 Teacher ${data.name} joined`);
            } else {
                document.getElementById('studentControls').classList.remove('hidden');
                addActivity('system', `👨‍🎓 Student ${data.name} joined the game`);
            }
        });

        socket.on('login_error', (message) => {
            document.getElementById('loginMessage').innerHTML = `<div class="error">${message}</div>`;
        });

        socket.on('update', (data) => {
            allStudents = data.students;
            updateLeaderboard(data.students);
            updateGameStatus(data.gameActive);
            
            if (currentRole === 'teacher') {
                updateOnlineStudents(data.students);
            } else if (currentRole === 'student') {
                updateStudentStatus(data.students);
            }
        });

        socket.on('limit_set', (data) => {
            if (currentRole === 'teacher') {
                addActivity('system', `📏 ${data.name}'s interaction limit set to ${data.limit}`);
            }
        });

        socket.on('credits_set', (data) => {
            if (currentRole === 'teacher') {
                addActivity('system', `💰 ${data.name}'s credits set to ${data.credits}`);
            }
        });

        socket.on('risky_result', (data) => {
            const message = data.points >= 0 ? 
                `🎉 ${data.studentName} risked it and got +${data.points} points!` :
                `😬 ${data.studentName} risked it and lost ${Math.abs(data.points)} point!`;
            
            document.getElementById('loginMessage').innerHTML = `<div class="success">${message}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 3000);
        });

        socket.on('powerup_bought', (data) => {
            document.getElementById('loginMessage').innerHTML = `<div class="success">✅ Bought ${data.effect}! Credits left: ${data.creditsLeft}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 3000);
        });

        socket.on('powerup_failed', (message) => {
            document.getElementById('loginMessage').innerHTML = `<div class="error">${message}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 2000);
        });

        socket.on('theft_occurred', (data) => {
            const message = `🔪 ${data.thief} stole ${data.points} points from ${data.victim}!`;
            document.getElementById('loginMessage').innerHTML = `<div class="error">${message}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 4000);
        });

        socket.on('double_used', (data) => {
            const message = `⚡ ${data.studentName} used Double Power!`;
            document.getElementById('loginMessage').innerHTML = `<div class="success">${message}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 2000);
        });

        socket.on('shield_blocked', (data) => {
            const message = `🛡️ ${data.studentName}'s shield blocked negative points!`;
            document.getElementById('loginMessage').innerHTML = `<div class="success">${message}</div>`;
            setTimeout(() => {
                document.getElementById('loginMessage').innerHTML = '';
            }, 2000);
        });

        socket.on('steal_targets', (targets) => {
            console.log('🎯 Received steal targets:', targets);
            const targetList = document.getElementById('targetList');
            
            if (targets.length === 0) {
                targetList.innerHTML = '<p style="color: #666; text-align: center;">No valid targets available!<br><small>Targets need points and no shield</small></p>';
                return;
            }
            
            targetList.innerHTML = targets.map(target => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; background: white; border-radius: 3px; border: 1px solid #ddd;">
                    <span><strong>${target.name}</strong><br><small>${target.score} points</small></span>
                    <button onclick="stealFromTarget('${target.username}', '${target.name}', ${target.score})" 
                            style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Steal 🔪
                    </button>
                </div>
            `).join('');
        });

        socket.on('disconnect', () => {
            document.getElementById('status').textContent = '❌ Disconnected';
            addActivity('system', '💔 Disconnected from server');
        });

        // Game functions
        function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                document.getElementById('loginMessage').innerHTML = '<div class="error">Please enter username and password</div>';
                return;
            }
            
            socket.emit('login', { username, password, role: selectedRole });
        }

        function logout() {
            location.reload();
        }

        function addScore() {
            socket.emit('add_score');
        }

        function riskyScore() {
            socket.emit('risky_score');
        }

        function buyPowerup(powerup) {
            socket.emit('buy_powerup', { powerup });
        }

        function showStealTargets() {
            console.log('🔪 Requesting steal targets...');
            socket.emit('get_steal_targets');
            document.getElementById('stealTargets').classList.remove('hidden');
            document.getElementById('targetList').innerHTML = 'Loading targets...';
        }

        function hideStealTargets() {
            document.getElementById('stealTargets').classList.add('hidden');
        }

        function stealFromTarget(targetUsername, targetName, targetScore) {
            console.log(`🔪 Stealing from ${targetName} (${targetUsername})`);
            socket.emit('steal_from_target', { targetUsername });
            hideStealTargets();
        }

        function resetScores() {
            if (confirm('Reset all scores?')) {
                socket.emit('reset_scores');
            }
        }

        function toggleGame() {
            socket.emit('toggle_game');
        }

        function setLimit(studentId, limit) {
            socket.emit('set_limit', { studentId, limit: parseInt(limit) });
        }

        function updateLeaderboard(students) {
            const list = document.getElementById('leaderboardList');
            
            if (students.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No students online yet</p>';
                return;
            }

            list.innerHTML = students.map(student => `
                <div class="student-item">
                    <div class="rank ${student.rank === 1 ? 'first' : student.rank === 2 ? 'second' : student.rank === 3 ? 'third' : ''}">
                        #${student.rank}
                    </div>
                    <div class="student-info">
                        <div class="student-name">
                            ${student.name}
                            ${student.shielded ? '🛡️' : ''}
                            ${student.doubleNext ? '⚡' : ''}
                        </div>
                        <div class="student-stats">
                            <span class="interactions">${student.interactions}/${student.maxInteractions} interactions</span>
                            <span class="credits">💰 ${student.credits || 0} credits</span>
                        </div>
                    </div>
                    <div class="score">${student.score}</div>
                </div>
            `).join('');
        }

        function updateGameStatus(active) {
            const statusEl = document.getElementById('gameStatus');
            const toggleEl = document.getElementById('toggleText');
            
            statusEl.textContent = active ? '🟢 Game Active' : '🔴 Game Paused';
            if (toggleEl) {
                toggleEl.textContent = active ? '⏸️ Pause Game' : '▶️ Resume Game';
            }
        }

        function updateOnlineStudents(students) {
            const container = document.getElementById('onlineStudents');
            
            if (students.length === 0) {
                container.innerHTML = 'No students online';
                return;
            }

            container.innerHTML = students.map(student => `
                <div class="online-student">
                    <span><strong>${student.name}</strong><br>Score: ${student.score} | 💰 ${student.credits || 0} credits</span>
                    <div class="limit-control">
                        <span>Limit:</span>
                        <input type="number" class="limit-input" value="${student.maxInteractions}" id="limit-${student.username}" min="1" max="20">
                        <button class="set-btn" onclick="setLimitByUsername('${student.username}')">Set</button>
                    </div>
                </div>
            `).join('');
            
            // Update credit controls
            const creditControls = document.getElementById('creditControls');
            creditControls.innerHTML = students.map(student => `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                    <strong>${student.name}</strong> (💰 ${student.credits || 0})
                    <div style="margin-top: 5px;">
                        <input type="number" value="${student.credits || 0}" id="credits-${student.username}" min="0" max="100" style="width: 80px; padding: 5px;">
                        <button class="set-btn" onclick="setCredits('${student.username}', document.getElementById('credits-${student.username}').value)">Set Credits</button>
                    </div>
                </div>
            `).join('');
        }

        function setCredits(username, credits) {
            console.log(`🎯 Setting credits for ${username} to ${credits}`);
            socket.emit('set_credits', { username, credits: parseInt(credits) });
        }

        function setLimitByUsername(username) {
            const input = document.getElementById(`limit-${username}`);
            const limit = parseInt(input.value);
            
            // Find student by username
            const student = allStudents.find(s => s.username === username);
            if (student) {
                socket.emit('set_limit_by_username', { username, limit });
            }
        }

        function updateStudentStatus(students) {
            // Find current student by username
            if (window.myUsername) {
                const myStudent = students.find(s => s.username === window.myUsername);
                if (myStudent) {
                    const remaining = myStudent.maxInteractions - myStudent.interactions;
                    const credits = myStudent.credits || 0;
                    
                    document.getElementById('interactionsLeft').textContent = remaining;
                    document.getElementById('creditsDisplay').textContent = credits;
                    
                    const canInteract = remaining > 0;
                    document.getElementById('scoreBtn').disabled = !canInteract;
                    document.getElementById('riskyBtn').disabled = !canInteract;
                    
                    // Update active effects display
                    const effects = [];
                    if (myStudent.doubleNext) effects.push('⚡ Double Next');
                    if (myStudent.shielded) effects.push(`🛡️ Shield (${myStudent.shieldDuration || 0} left)`);
                    document.getElementById('effectsList').textContent = effects.length > 0 ? effects.join(', ') : 'None';
                    
                    if (!canInteract) {
                        document.getElementById('scoreBtn').innerHTML = '❌ No interactions left';
                        document.getElementById('riskyBtn').innerHTML = '❌ No interactions left';
                    } else {
                        const safeText = myStudent.doubleNext ? '⭐ Safe +2 Points<br><small>Double Active!</small>' : '⭐ Safe +1 Point<br><small>+1 Credit</small>';
                        const riskyText = myStudent.doubleNext ? '🎲 Risky -2 to +6 Points<br><small>Double Active!</small>' : '🎲 Risky -1 to +3 Points<br><small>+2 Credits</small>';
                        
                        document.getElementById('scoreBtn').innerHTML = safeText;
                        document.getElementById('riskyBtn').innerHTML = riskyText;
                    }
                }
            }
        }
    </script>
</body>
</html>
