const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Student and Teacher accounts
const AUTH_DATA = {
  teachers: {
    "teacher123": { password: "teach2024", name: "Mr. Smith" },
    "admin": { password: "admin123", name: "Admin" }
  },
  students: {
    "student1": { password: "pass1", name: "Alice Johnson" },
    "student2": { password: "pass2", name: "Bob Wilson" },
    "student3": { password: "pass3", name: "Carol Davis" },
    "student4": { password: "pass4", name: "David Brown" },
    "student5": { password: "pass5", name: "Emma Garcia" }
  }
};

// Game state
let gameState = {
  students: new Map(),
  teachers: new Map(),
  leaderboard: [],
  gameActive: true,
  sessions: new Map()
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send initial game state
  socket.emit('game_state', {
    students: Array.from(gameState.students.entries()),
    teachers: Array.from(gameState.teachers.entries()),
    leaderboard: gameState.leaderboard,
    gameActive: gameState.gameActive
  });
  
  // Handle login requests
  socket.on('login', (data) => {
    console.log('🔐 Login attempt received:', data.username, data.role);
    console.log('🔍 Login data:', JSON.stringify(data));
    const { username, password, role } = data;
    
    let isValid = false;
    let userData = null;
    
    // Check credentials
    if (role === 'teacher') {
      console.log('Checking teacher credentials...');
      console.log('Available teachers:', Object.keys(AUTH_DATA.teachers));
      console.log('Looking for username:', username);
      console.log('Username exists?', AUTH_DATA.teachers[username] ? 'YES' : 'NO');
      
      if (AUTH_DATA.teachers[username]) {
        console.log('Expected password:', AUTH_DATA.teachers[username].password);
        console.log('Provided password:', password);
        console.log('Passwords match?', AUTH_DATA.teachers[username].password === password);
        
        if (AUTH_DATA.teachers[username].password === password) {
          isValid = true;
          userData = AUTH_DATA.teachers[username];
          console.log('✅ Teacher login valid');
        } else {
          console.log('❌ Teacher password mismatch');
        }
      } else {
        console.log('❌ Teacher username not found');
      }
    } else if (role === 'student') {
      console.log('Checking student credentials...');
      console.log('Available students:', Object.keys(AUTH_DATA.students));
      console.log('Looking for username:', username);
      
      if (AUTH_DATA.students[username]) {
        console.log('Expected password:', AUTH_DATA.students[username].password);
        console.log('Provided password:', password);
        
        if (AUTH_DATA.students[username].password === password) {
          isValid = true;
          userData = AUTH_DATA.students[username];
          console.log('✅ Student login valid');
        } else {
          console.log('❌ Student password mismatch');
        }
      } else {
        console.log('❌ Student username not found');
      }
    } else {
      console.log('❌ Unknown role:', role);
    }
    
    if (isValid) {
      // Store session
      gameState.sessions.set(socket.id, { username, role });
      
      if (role === 'teacher') {
        gameState.teachers.set(socket.id, {
          username,
          name: userData.name
        });
        console.log(`✅ Teacher ${userData.name} logged in successfully`);
      } else {
        gameState.students.set(socket.id, {
          username,
          name: userData.name,
          score: 0,
          interactions: 0,
          maxInteractions: 5
        });
        updateLeaderboard();
        console.log(`✅ Student ${userData.name} logged in successfully`);
      }
      
      // Send success response
      socket.emit('login_success', {
        role,
        username,
        name: userData.name
      });
      
      broadcastGameState();
    } else {
      console.log('❌ Login failed - sending error');
      socket.emit('login_error', 'Invalid username or password');
    }
  });
  
  // Require authentication for other actions
  function requireAuth(requiredRole = null) {
    const session = gameState.sessions.get(socket.id);
    if (!session) {
      socket.emit('error', 'Not authenticated');
      return null;
    }
    if (requiredRole && session.role !== requiredRole) {
      socket.emit('error', `Only ${requiredRole}s can perform this action`);
      return null;
    }
    return session;
  }
  
  // Student adds score
  socket.on('add_score', (data) => {
    console.log('Score add request from:', socket.id);
    const session = requireAuth('student');
    if (!session) return;
    
    const student = gameState.students.get(socket.id);
    
    if (!gameState.gameActive) {
      socket.emit('error', 'Game is not active');
      return;
    }
    
    if (student.interactions >= student.maxInteractions) {
      socket.emit('error', 'You have reached your interaction limit');
      return;
    }
    
    const scoreToAdd = data.points || 1;
    student.score += scoreToAdd;
    student.interactions += 1;
    
    gameState.students.set(socket.id, student);
    updateLeaderboard();
    broadcastGameState();
    
    console.log(`${student.name} added ${scoreToAdd} points (Score: ${student.score})`);
    
    io.emit('score_added', {
      studentName: student.name,
      points: scoreToAdd,
      newScore: student.score
    });
  });
  
  // Teacher reset game
  socket.on('reset_game', () => {
    if (!requireAuth('teacher')) return;
    
    for (let [studentId, student] of gameState.students) {
      student.score = 0;
      student.interactions = 0;
      gameState.students.set(studentId, student);
    }
    
    updateLeaderboard();
    broadcastGameState();
    
    console.log('Game reset by teacher');
    io.emit('game_reset', 'Game has been reset by teacher');
  });
  
  // Teacher toggle game
  socket.on('toggle_game', () => {
    if (!requireAuth('teacher')) return;
    
    gameState.gameActive = !gameState.gameActive;
    broadcastGameState();
    
    console.log(`Game ${gameState.gameActive ? 'activated' : 'paused'} by teacher`);
    io.emit('game_status_changed', {
      active: gameState.gameActive,
      message: `Game ${gameState.gameActive ? 'resumed' : 'paused'} by teacher`
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const session = gameState.sessions.get(socket.id);
    if (session) {
      if (session.role === 'teacher') {
        const teacher = gameState.teachers.get(socket.id);
        if (teacher) {
          console.log(`Teacher ${teacher.name} disconnected`);
          gameState.teachers.delete(socket.id);
        }
      } else {
        const student = gameState.students.get(socket.id);
        if (student) {
          console.log(`Student ${student.name} disconnected`);
          gameState.students.delete(socket.id);
          updateLeaderboard();
        }
      }
      gameState.sessions.delete(socket.id);
      broadcastGameState();
    }
  });
});

function updateLeaderboard() {
  gameState.leaderboard = Array.from(gameState.students.values())
    .sort((a, b) => b.score - a.score)
    .map((student, index) => ({
      rank: index + 1,
      name: student.name,
      username: student.username,
      score: student.score,
      interactions: student.interactions,
      maxInteractions: student.maxInteractions
    }));
}

function broadcastGameState() {
  io.emit('game_state', {
    students: Array.from(gameState.students.entries()),
    teachers: Array.from(gameState.teachers.entries()),
    leaderboard: gameState.leaderboard,
    gameActive: gameState.gameActive
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Leaderboard Server running on port ${PORT}`);
  console.log('📊 Ready for logins!');
  console.log('👨‍🏫 Teacher accounts:');
  Object.entries(AUTH_DATA.teachers).forEach(([username, data]) => {
    console.log(`   - ${username} / ${data.password} (${data.name})`);
  });
  console.log('👨‍🎓 Student accounts:');
  Object.entries(AUTH_DATA.students).forEach(([username, data]) => {
    console.log(`   - ${username} / ${data.password} (${data.name})`);
  });
});
