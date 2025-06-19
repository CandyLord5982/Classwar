const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Serve static files
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Authentication data
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
  
  socket.emit('game_state', {
    students: Array.from(gameState.students.entries()),
    teachers: Array.from(gameState.teachers.entries()),
    leaderboard: gameState.leaderboard,
    gameActive: gameState.gameActive,
    isAuthenticated: false
  });
  
  // Handle login
  socket.on('login', (data) => {
    console.log('Login attempt:', data.username, data.role);
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
      gameState.sessions.set(socket.id, { username, role });
      
      if (role === 'teacher') {
        gameState.teachers.set(socket.id, {
          username,
          name: userData.name
        });
      } else {
        gameState.students.set(socket.id, {
          username,
          name: userData.name,
          score: 0,
          interactions: 0,
          maxInteractions: 5
        });
        updateLeaderboard();
      }
      
      socket.emit('login_success', {
        role,
        username,
        name: userData.name
      });
      
      broadcastGameState();
      console.log(`${role} ${userData.name} logged in successfully`);
    } else {
      socket.emit('login_error', 'Invalid username or password');
      console.log('Login failed for:', username);
    }
  });
  
  // Require authentication
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
    io.emit('game_reset', 'Game has been reset by teacher');
  });
  
  // Teacher toggle game
  socket.on('toggle_game', () => {
    if (!requireAuth('teacher')) return;
    
    gameState.gameActive = !gameState.gameActive;
    broadcastGameState();
    
    io.emit('game_status_changed', {
      active: gameState.gameActive,
      message: `Game ${gameState.gameActive ? 'resumed' : 'paused'} by teacher`
    });
  });
  
  // Set interaction limit
  socket.on('set_interaction_limit', (data) => {
    if (!requireAuth('teacher')) return;
    
    const { studentId, limit } = data;
    if (gameState.students.has(studentId)) {
      const student = gameState.students.get(studentId);
      student.maxInteractions = limit;
      gameState.students.set(studentId, student);
      broadcastGameState();
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const session = gameState.sessions.get(socket.id);
    if (session) {
      if (session.role === 'teacher') {
        gameState.teachers.delete(socket.id);
      } else {
        gameState.students.delete(socket.id);
        updateLeaderboard();
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
  console.log('📊 Login credentials:');
  console.log('Teacher: teacher123 / teach2024');
  console.log('Student: student1 / pass1');
});
