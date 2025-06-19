// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Serve static files with correct MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Authentication data - You can modify these
const AUTH_DATA = {
  // Teacher credentials
  teachers: {
    "teacher123": { password: "teach2024", name: "Mr. Smith" },
    "admin": { password: "admin123", name: "Admin" }
  },
  
  // Student credentials - Add your students here
  students: {
    "student1": { password: "pass1", name: "Alice Johnson" },
    "student2": { password: "pass2", name: "Bob Wilson" },
    "student3": { password: "pass3", name: "Carol Davis" },
    "student4": { password: "pass4", name: "David Brown" },
    "student5": { password: "pass5", name: "Emma Garcia" },
    "john123": { password: "john2024", name: "John Smith" },
    "mary456": { password: "mary2024", name: "Mary Jones" },
    "alex789": { password: "alex2024", name: "Alex Chen" }
  }
};

// Game state
let gameState = {
  students: new Map(), // studentId -> {username, name, score, interactions, maxInteractions}
  teachers: new Map(), // teacherId -> {username, name}
  leaderboard: [],
  gameActive: true,
  sessions: new Map() // socketId -> {username, role}
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current state to new user
  socket.emit('game_state', {
    students: Array.from(gameState.students.entries()),
    teachers: Array.from(gameState.teachers.entries()),
    leaderboard: gameState.leaderboard,
    gameActive: gameState.gameActive,
    isAuthenticated: false
  });
  
  // Handle login attempts
  socket.on('login', (data) => {
    const { username, password, role } = data;
    
    let isValid = false;
    let userData = null;
    
    if (role === 'teacher') {
      if (AUTH_DATA.teachers[username] && AUTH_DATA.teachers[username].password === password) {
        isValid = true;
        userData = AUTH_DATA.teachers[username];
      }
    } else if (role === 'student') {
      if (AUTH_DATA.students[username] && AUTH_DATA.students[username].password === password) {
        isValid = true;
        userData = AUTH_DATA.students[username];
      }
    }
    
    if (isValid) {
      // Check if user is already logged in
      const existingSession = Array.from(gameState.sessions.entries())
        .find(([socketId, session]) => session.username === username);
      
      if (existingSession) {
        socket.emit('login_error', 'This account is already logged in from another device');
        return;
      }
      
      // Store session
      gameState.sessions.set(socket.id, { username, role });
      
      if (role === 'teacher') {
        gameState.teachers.set(socket.id, {
          username,
          name: userData.name
        });
        console.log(`Teacher ${userData.name} (${username}) logged in`);
      } else {
        gameState.students.set(socket.id, {
          username,
          name: userData.name,
          score: 0,
          interactions: 0,
          maxInteractions: 5
        });
        updateLeaderboard();
        console.log(`Student ${userData.name} (${username}) logged in`);
      }
      
      socket.emit('login_success', {
        role,
        username,
        name: userData.name
      });
      
      broadcastGameState();
    } else {
      socket.emit('login_error', 'Invalid username or password');
    }
  });
  
  // Verify authentication for all other actions
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
  
  // Teacher sets interaction limits for students
  socket.on('set_interaction_limit', (data) => {
    if (!requireAuth('teacher')) return;
    
    const { studentId, limit } = data;
    if (gameState.students.has(studentId)) {
      const student = gameState.students.get(studentId);
      student.maxInteractions = limit;
      gameState.students.set(studentId, student);
      
      console.log(`Teacher set ${student.name}'s interaction limit to ${limit}`);
      broadcastGameState();
    }
  });
  
  // Teacher resets game
  socket.on('reset_game', () => {
    if (!requireAuth('teacher')) return;
    
    // Reset all student scores and interactions
    for (let [studentId, student] of gameState.students) {
      student.score = 0;
      student.interactions = 0;
      gameState.students.set(studentId, student);
    }
    
    updateLeaderboard();
    console.log('Game reset by teacher');
    broadcastGameState();
    
    // Notify all users
    io.emit('game_reset', 'Game has been reset by teacher');
  });
  
  // Student adds score
  socket.on('add_score', (data) => {
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
    
    // Add score and increment interactions
    const scoreToAdd = data.points || 1;
    student.score += scoreToAdd;
    student.interactions += 1;
    
    gameState.students.set(socket.id, student);
    updateLeaderboard();
    
    console.log(`${student.name} (${student.username}) added ${scoreToAdd} points (${student.interactions}/${student.maxInteractions} interactions used)`);
    
    // Broadcast updated state
    broadcastGameState();
    
    // Notify about the score addition
    io.emit('score_added', {
      studentName: student.name,
      points: scoreToAdd,
      newScore: student.score,
      interactionsLeft: student.maxInteractions - student.interactions
    });
  });
  
  // Toggle game active state (teachers only)
  socket.on('toggle_game', () => {
    if (!requireAuth('teacher')) return;
    
    gameState.gameActive = !gameState.gameActive;
    console.log(`Game ${gameState.gameActive ? 'activated' : 'paused'} by teacher`);
    broadcastGameState();
    
    io.emit('game_status_changed', {
      active: gameState.gameActive,
      message: `Game ${gameState.gameActive ? 'resumed' : 'paused'} by teacher`
    });
  });
  
  // Add new student (teachers only)
  socket.on('add_student_account', (data) => {
    if (!requireAuth('teacher')) return;
    
    const { username, password, name } = data;
    
    if (AUTH_DATA.students[username]) {
      socket.emit('error', 'Username already exists');
      return;
    }
    
    AUTH_DATA.students[username] = { password, name };
    socket.emit('student_added', { username, name });
    console.log(`Teacher added new student account: ${username} (${name})`);
  });
  
  // Get student accounts (teachers only)
  socket.on('get_student_accounts', () => {
    if (!requireAuth('teacher')) return;
    
    const accounts = Object.entries(AUTH_DATA.students).map(([username, data]) => ({
      username,
      name: data.name,
      isOnline: Array.from(gameState.students.values()).some(s => s.username === username)
    }));
    
    socket.emit('student_accounts', accounts);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const session = gameState.sessions.get(socket.id);
    
    if (session) {
      if (session.role === 'teacher') {
        const teacher = gameState.teachers.get(socket.id);
        if (teacher) {
          console.log(`Teacher ${teacher.name} (${teacher.username}) disconnected`);
          gameState.teachers.delete(socket.id);
        }
      } else if (session.role === 'student') {
        const student = gameState.students.get(socket.id);
        if (student) {
          console.log(`Student ${student.name} (${student.username}) disconnected`);
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
  console.log('📊 Secure login system enabled!');
  console.log('\n👨‍🏫 Teacher accounts:');
  Object.entries(AUTH_DATA.teachers).forEach(([username, data]) => {
    console.log(`   ${username} / ${data.password} (${data.name})`);
  });
  console.log('\n👨‍🎓 Student accounts:');
  Object.entries(AUTH_DATA.students).forEach(([username, data]) => {
    console.log(`   ${username} / ${data.password} (${data.name})`);
  });
});
