const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server);

// Simple credentials
const ACCOUNTS = {
  teachers: {
    "teacher123": { password: "teach2024", name: "Teacher" }
  },
  students: {
    "student1": { password: "pass1", name: "Alice Johnson" },
    "student2": { password: "pass2", name: "Bob Wilson" },
    "student3": { password: "pass3", name: "Carol Davis" }
  }
};

// Simple game state
let students = new Map(); // socketId -> student data
let teachers = new Map(); // socketId -> teacher data
let gameActive = true;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);
  
  // Send current state
  socket.emit('update', {
    students: Array.from(students.values()),
    gameActive: gameActive
  });
  
  // Handle login
  socket.on('login', (data) => {
    const { username, password, role } = data;
    console.log('Login attempt:', username, role);
    
    if (role === 'teacher' && ACCOUNTS.teachers[username]?.password === password) {
      teachers.set(socket.id, { username, name: ACCOUNTS.teachers[username].name });
      socket.emit('login_success', { role: 'teacher', name: ACCOUNTS.teachers[username].name, username });
      console.log('Teacher logged in:', ACCOUNTS.teachers[username].name);
      
      // Broadcast teacher join activity
      io.emit('activity_update', {
        type: 'system',
        message: `👨‍🏫 Teacher ${ACCOUNTS.teachers[username].name} has joined`
      });
    } 
    else if (role === 'student' && ACCOUNTS.students[username]?.password === password) {
      students.set(socket.id, {
        username,
        name: ACCOUNTS.students[username].name,
        score: 0,
        interactions: 0,
        maxInteractions: 5,
        credits: 10,
        doubleNext: false,
        shielded: false,
        shieldDuration: 0
      });
      socket.emit('login_success', { role: 'student', name: ACCOUNTS.students[username].name, username });
      console.log('Student logged in:', ACCOUNTS.students[username].name);
      
      // Broadcast student join activity
      io.emit('activity_update', {
        type: 'system',
        message: `👨‍🎓 ${ACCOUNTS.students[username].name} joined the game`
      });
      
      broadcastUpdate();
    } 
    else {
      socket.emit('login_error', 'Invalid credentials');
    }
  });
  
  // Student adds score (safe button)
  socket.on('add_score', () => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    if (student.interactions < student.maxInteractions) {
        let pointsGained = 1;
        
        if (student.doubleNext) {
            pointsGained = 2;
            student.doubleNext = false;
            io.emit('activity_update', {
                type: 'powerup',
                message: `⚡ ${student.name} used Double Power for +${pointsGained} points!`
            });
        } else {
            io.emit('activity_update', {
                type: 'safe',
                message: `✅ ${student.name} safely earned +${pointsGained} point`
            });
        }
        
        student.score += pointsGained;
        student.interactions += 1;
        student.credits = (student.credits || 0) + 1;
        
        if (student.shielded && student.shieldDuration > 0) {
            student.shieldDuration--;
            if (student.shieldDuration <= 0) {
                student.shielded = false;
            }
        }
        
        students.set(socket.id, student);
        broadcastUpdate();
    }
  });
  
  socket.on('risky_score', () => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    if (student.interactions < student.maxInteractions) {
        let randomPoints = Math.floor(Math.random() * 5) - 1;
        let originalPoints = randomPoints;
        
        if (student.doubleNext && randomPoints > 0) {
            randomPoints *= 2;
            student.doubleNext = false;
            io.emit('activity_update', {
                type: 'powerup',
                message: `⚡ ${student.name} used Double Power on risky roll!`
            });
        }
        
        if (randomPoints < 0 && student.shielded) {
            io.emit('activity_update', {
                type: 'shield',
                message: `🛡️ ${student.name}'s shield blocked ${randomPoints} damage!`
            });
            randomPoints = 0;
        }
        
        student.score = Math.max(0, student.score + randomPoints);
        student.interactions += 1;
        student.credits = (student.credits || 0) + 2;
        
        // Activity message
        const emoji = randomPoints > 0 ? '🎉' : randomPoints < 0 ? '😬' : '😐';
        const verb = randomPoints > 0 ? 'gained' : randomPoints < 0 ? 'lost' : 'got';
        io.emit('activity_update', {
            type: 'risky',
            message: `${emoji} ${student.name} risked it and ${verb} ${Math.abs(randomPoints)} points!`
        });
        
        if (student.shielded && student.shieldDuration > 0) {
            student.shieldDuration--;
            if (student.shieldDuration <= 0) {
                student.shielded = false;
            }
        }
        
        students.set(socket.id, student);
        broadcastUpdate();
    }
  });
  
  // Get steal targets (students only)
  socket.on('get_steal_targets', () => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    // Find all students with points > 0, excluding the requester
    const targets = Array.from(students.values())
      .filter(s => s.score > 0 && s.username !== student.username && !s.shielded)
      .map(s => ({
        username: s.username,
        name: s.name,
        score: s.score
      }));
    
    console.log(`${student.name} requested steal targets. Found: ${targets.length}`);
    socket.emit('steal_targets', targets);
  });
  
  // Steal from specific target
  socket.on('steal_from_target', (data) => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    const { targetUsername } = data;
    const cost = 8;
    
    if (student.credits < cost) {
      socket.emit('powerup_failed', 'Not enough credits!');
      return;
    }
    
    // Find the target
    let targetSocketId = null;
    let target = null;
    
    for (let [socketId, s] of students) {
      if (s.username === targetUsername) {
        targetSocketId = socketId;
        target = s;
        break;
      }
    }
    
    if (!target) {
      socket.emit('powerup_failed', 'Target not found!');
      return;
    }
    
    if (target.score <= 0) {
      socket.emit('powerup_failed', 'Target has no points to steal!');
      return;
    }
    
    if (target.shielded) {
      socket.emit('powerup_failed', `${target.name} is protected by a shield!`);
      return;
    }
    
    // Perform the theft
    const stolenPoints = Math.min(2, target.score); // Steal up to 2 points
    target.score -= stolenPoints;
    student.score += stolenPoints;
    student.credits -= cost;
    
    // Update both students
    students.set(targetSocketId, target);
    students.set(socket.id, student);
    
    console.log(`${student.name} stole ${stolenPoints} points from ${target.name}`);
    
    // Broadcast theft activity
    io.emit('activity_update', {
      type: 'steal',
      message: `🔪 ${student.name} stole ${stolenPoints} points from ${target.name}!`
    });
    
    // Notify everyone about the theft
    io.emit('theft_occurred', {
      thief: student.name,
      victim: target.name,
      points: stolenPoints
    });
    
    socket.emit('powerup_bought', {
      powerup: 'steal_points',
      effect: `Stole ${stolenPoints} points from ${target.name}`,
      creditsLeft: student.credits
    });
    
    broadcastUpdate();
  });
  
  // Purchase other power-ups
  socket.on('buy_powerup', (data) => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    const { powerup } = data;
    let cost = 0;
    let effect = '';
    
    switch(powerup) {
      case 'double_next':
        cost = 6;
        if (student.credits >= cost) {
          student.credits -= cost;
          student.doubleNext = true;
          effect = 'Next interaction will give double points!';
          
          io.emit('activity_update', {
            type: 'powerup',
            message: `⚡ ${student.name} bought Double Next power-up!`
          });
        }
        break;
        
      case 'shield':
        cost = 10;
        if (student.credits >= cost) {
          student.credits -= cost;
          student.shielded = true;
          student.shieldDuration = 3;
          effect = 'Protected from theft and negative points for 3 interactions!';
          
          io.emit('activity_update', {
            type: 'powerup',
            message: `🛡️ ${student.name} activated a protective shield!`
          });
        }
        break;
        
      case 'random_bonus':
        cost = 5;
        if (student.credits >= cost) {
          const bonusPoints = Math.floor(Math.random() * 4) + 1; // 1-4 random points
          student.credits -= cost;
          student.score += bonusPoints;
          effect = `Gained ${bonusPoints} random bonus points!`;
          
          io.emit('activity_update', {
            type: 'powerup',
            message: `🎁 ${student.name} got ${bonusPoints} random bonus points!`
          });
        }
        break;
    }
    
    if (effect) {
      students.set(socket.id, student);
      console.log(`${student.name} bought ${powerup} for ${cost} credits. Effect: ${effect}`);
      
      socket.emit('powerup_bought', {
        powerup: powerup,
        effect: effect,
        creditsLeft: student.credits
      });
      
      broadcastUpdate();
    } else {
      socket.emit('powerup_failed', 'Not enough credits!');
    }
  });
  
  // Teacher controls
  socket.on('reset_scores', () => {
    if (!teachers.has(socket.id)) return;
    
    const teacher = teachers.get(socket.id);
    
    for (let [id, student] of students) {
      student.score = 0;
      student.interactions = 0;
      student.credits = 10;
      student.doubleNext = false;
      student.shielded = false;
      student.shieldDuration = 0;
      students.set(id, student);
    }
    
    console.log('Scores reset by teacher');
    
    io.emit('activity_update', {
      type: 'system',
      message: `🔄 ${teacher.name} reset all scores and credits`
    });
    
    broadcastUpdate();
  });
  
  socket.on('toggle_game', () => {
    if (!teachers.has(socket.id)) return;
    
    const teacher = teachers.get(socket.id);
    gameActive = !gameActive;
    
    console.log('Game', gameActive ? 'resumed' : 'paused');
    
    io.emit('activity_update', {
      type: 'system',
      message: gameActive ? `▶️ ${teacher.name} resumed the game` : `⏸️ ${teacher.name} paused the game`
    });
    
    broadcastUpdate();
  });
  
  // Set limit by username
  socket.on('set_limit_by_username', (data) => {
    if (!teachers.has(socket.id)) return;
    
    const { username, limit } = data;
    const teacher = teachers.get(socket.id);
    console.log(`Setting limit for ${username} to ${limit}`);
    
    for (let [socketId, student] of students) {
      if (student.username === username) {
        student.maxInteractions = limit;
        students.set(socketId, student);
        console.log(`✅ Set ${student.name}'s limit to ${limit}`);
        
        socket.emit('limit_set', { 
          name: student.name, 
          limit: limit 
        });
        
        io.emit('activity_update', {
          type: 'system',
          message: `📏 ${teacher.name} set ${student.name}'s interaction limit to ${limit}`
        });
        
        broadcastUpdate();
        return;
      }
    }
    
    console.log(`❌ Student ${username} not found`);
  });
  
  // Set credits for student (teacher only)
  socket.on('set_credits', (data) => {
    if (!teachers.has(socket.id)) return;
    
    const { username, credits } = data;
    const teacher = teachers.get(socket.id);
    console.log(`🎯 Setting credits for ${username} to ${credits}`);
    
    for (let [socketId, student] of students) {
      if (student.username === username) {
        const oldCredits = student.credits;
        student.credits = credits;
        students.set(socketId, student);
        console.log(`✅ Set ${student.name}'s credits to ${credits}`);
        
        socket.emit('credits_set', { 
          name: student.name, 
          credits: credits 
        });
        
        io.emit('activity_update', {
          type: 'system',
          message: `💰 ${teacher.name} changed ${student.name}'s credits from ${oldCredits} to ${credits}`
        });
        
        broadcastUpdate();
        return;
      }
    }
    
    console.log(`❌ Student ${username} not found`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    if (students.has(socket.id)) {
      const student = students.get(socket.id);
      console.log('Student disconnected:', student.name);
      
      io.emit('activity_update', {
        type: 'system',
        message: `👋 ${student.name} left the game`
      });
      
      students.delete(socket.id);
      broadcastUpdate();
    }
    if (teachers.has(socket.id)) {
      const teacher = teachers.get(socket.id);
      console.log('Teacher disconnected');
      
      io.emit('activity_update', {
        type: 'system',
        message: `👋 Teacher ${teacher.name} left`
      });
      
      teachers.delete(socket.id);
    }
  });
});

function broadcastUpdate() {
  const sortedStudents = Array.from(students.values())
    .map(student => ({
      ...student,
      credits: student.credits || 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  
  io.emit('update', {
    students: sortedStudents,
    gameActive: gameActive
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Teacher: teacher123 / teach2024');
  console.log('Students: student1/pass1, student2/pass2, student3/pass3');
});
