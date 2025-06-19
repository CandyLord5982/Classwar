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

// Game state
let gameState = {
  students: new Map(), // studentId -> {name, score, interactions, maxInteractions}
  teachers: new Map(), // teacherId -> {name}
  leaderboard: [],
  gameActive: true
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current state to new user
  socket.emit('game_state', {
    students: Array.from(gameState.students.entries()),
    teachers: Array.from(gameState.teachers.entries()),
    leaderboard: gameState.leaderboard,
    gameActive: gameState.gameActive
  });
  
  // Handle user joining as teacher or student
  socket.on('join_as', (data) => {
    const { role, name } = data;
    
    if (role === 'teacher') {
      gameState.teachers.set(socket.id, { name });
      console.log(`Teacher ${name} joined`);
    } else if (role === 'student') {
      gameState.students.set(socket.id, {
        name,
        score: 0,
        interactions: 0,
        maxInteractions: 5 // Default: 5 interactions per student
      });
      updateLeaderboard();
      console.log(`Student ${name} joined`);
    }
    
    // Broadcast updated state to all users
    broadcastGameState();
  });
  
  // Teacher sets interaction limits for students
  socket.on('set_interaction_limit', (data) => {
    // Verify sender is a teacher
    if (!gameState.teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can set interaction limits');
      return;
    }
    
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
    // Verify sender is a teacher
    if (!gameState.teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can reset the game');
      return;
    }
    
    // Reset all student scores and interactions
    for (let [studentId, student] of gameState.students) {
      student.score = 0;
      student.interactions = 0;
      gameState.students.set(studentId, student);
    }
    
    updateLeaderboard();
    console.log('Game reset by teacher');
    broadcastGameState();
  });
  
  // Student adds score
  socket.on('add_score', (data) => {
    const student = gameState.students.get(socket.id);
    
    if (!student) {
      socket.emit('error', 'Only students can add scores');
      return;
    }
    
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
    
    console.log(`${student.name} added ${scoreToAdd} points (${student.interactions}/${student.maxInteractions} interactions used)`);
    
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
    if (!gameState.teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can toggle game state');
      return;
    }
    
    gameState.gameActive = !gameState.gameActive;
    console.log(`Game ${gameState.gameActive ? 'activated' : 'paused'} by teacher`);
    broadcastGameState();
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const wasTeacher = gameState.teachers.has(socket.id);
    const wasStudent = gameState.students.has(socket.id);
    
    if (wasTeacher) {
      const teacher = gameState.teachers.get(socket.id);
      console.log(`Teacher ${teacher.name} disconnected`);
      gameState.teachers.delete(socket.id);
    }
    
    if (wasStudent) {
      const student = gameState.students.get(socket.id);
      console.log(`Student ${student.name} disconnected`);
      gameState.students.delete(socket.id);
      updateLeaderboard();
    }
    
    broadcastGameState();
  });
});

function updateLeaderboard() {
  gameState.leaderboard = Array.from(gameState.students.values())
    .sort((a, b) => b.score - a.score)
    .map((student, index) => ({
      rank: index + 1,
      name: student.name,
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
  console.log('📊 Teachers can manage game, students can add scores!');
});
