const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server);

// Simple credentials with default avatars
const ACCOUNTS = {
  teachers: {
    "teacher123": { password: "Coldplay5982@", name: "Teacher", avatar: "https://i.pravatar.cc/150?img=50" }
  },
  students: {
    "nkhanh": { password: "pass1", name: "Nam Khanh", avatar: "https://i.pravatar.cc/150?img=1" },
    "haianh": { password: "pass1", name: "Hai Anh", avatar: "https://i.pravatar.cc/150?img=2" },
    "ducluong": { password: "pass1", name: "Duc Luong", avatar: "https://i.pravatar.cc/150?img=3" },
     "ngocminh": { password: "pass1", name: "Quoc Minh", avatar: "https://i.pravatar.cc/150?img=2" },
     "duongkhoi": { password: "pass1", name: "Duong Khoi", avatar: "https://i.pravatar.cc/150?img=2" },
     "thungoc": { password: "pass1", name: "Thu Ngoc", avatar: "https://i.pravatar.cc/150?img=2" },
     "qhuy": { password: "pass1", name: "Huy", avatar: "https://i.pravatar.cc/150?img=2" },
     "baolong": { password: "pass1", name: "Bao Long", avatar: "https://i.pravatar.cc/150?img=2" },
     "khoiphan": { password: "pass1", name: "Phan Khoi", avatar: "https://i.pravatar.cc/150?img=2" },
     "baongoc": { password: "pass1", name: "Bao Ngoc", avatar: "https://i.pravatar.cc/150?img=2" },
    "xuanbach": { password: "pass1", name: "Xuan Bach", avatar: "https://i.pravatar.cc/150?img=2" },
    "khanhnam": { password: "pass1", name: "Khanh Nam", avatar: "https://i.pravatar.cc/150?img=2" },
  }
};

// Track used avatars
let usedAvatars = new Set();

// Function to release avatar when student disconnects
function releaseAvatar(avatar) {
    if (avatar) {
        usedAvatars.delete(avatar);
        console.log(`Released avatar: ${avatar}`);
        
        // Broadcast updated available avatars to all clients
        io.emit('avatar_released', avatar);
    }
}

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
    console.log('🎯 DEBUG - Full data received:', JSON.stringify(data, null, 2));
    
    const username = data.username;
    const password = data.password; 
    const role = data.role;
    const avatar = data.avatar;
    
    console.log('🎯 DEBUG - Avatar value:', avatar || 'NOT_PROVIDED');
    console.log('Login attempt:', username, role);
    
    if (role === 'teacher' && ACCOUNTS.teachers[username]?.password === password) {
        const finalAvatar = avatar || ACCOUNTS.teachers[username].avatar;
        teachers.set(socket.id, { 
            username, 
            name: ACCOUNTS.teachers[username].name,
            avatar: finalAvatar 
        });
        socket.emit('login_success', { 
            role: 'teacher', 
            name: ACCOUNTS.teachers[username].name, 
            username,
            avatar: finalAvatar
        });
        console.log('Teacher logged in:', ACCOUNTS.teachers[username].name, 'with avatar:', finalAvatar);
        
        io.emit('activity_update', {
            type: 'system',
            message: `👨‍🏫 Teacher ${ACCOUNTS.teachers[username].name} has joined`
        });
    } 
    else if (role === 'student' && ACCOUNTS.students[username]?.password === password) {
        const requestedAvatar = avatar || ACCOUNTS.students[username].avatar;
        
        // Check if avatar is already in use
        if (usedAvatars.has(requestedAvatar)) {
            socket.emit('login_error', 'Avatar already in use! Please choose another one.');
            return;
        }
        
        // Mark avatar as used
        usedAvatars.add(requestedAvatar);
        console.log(`Avatar locked: ${requestedAvatar}`);
        
        // Broadcast to all clients that this avatar is now taken
        io.emit('avatar_taken', requestedAvatar);
        
        const finalAvatar = requestedAvatar;
        console.log('🎯 DEBUG - Using final avatar for student:', finalAvatar);
        
        students.set(socket.id, {
            username,
            name: ACCOUNTS.students[username].name,
            avatar: finalAvatar,
            score: 0,
            interactions: 0,
            maxInteractions: 5,
            credits: 10,
            doubleNext: false,
            shielded: false,
            shieldDuration: 0
        });
        
        socket.emit('login_success', { 
            role: 'student', 
            name: ACCOUNTS.students[username].name, 
            username,
            avatar: finalAvatar
        });
        console.log('Student logged in:', ACCOUNTS.students[username].name, 'with avatar:', finalAvatar);
        
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
        let pointsGained = 2;
        
        if (student.doubleNext) {
            pointsGained = 4;
            student.doubleNext = false;
            io.emit('activity_update', {
                type: 'powerup',
                message: `⚡ ${student.name} used Double Power for +${pointsGained} points!`
            });
        } else {
            io.emit('activity_update', {
                type: 'safe',
                message: `✅ ${student.name} safely earned +${pointsGained} points`
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
        let randomPoints = 0;
        let originalPoints = 0;
        
        // New probability distribution
        const random = Math.random();
        if (random < 0.2) {
            // 20% chance: give 1 or 2 points to other students
            const pointsToGive = Math.random() < 0.5 ? 1 : 2;
            randomPoints = -pointsToGive; // Negative for giving away
            originalPoints = randomPoints;
            
            // Find other students to give points to
            const otherStudents = Array.from(students.values())
                .filter(s => s.username !== student.username && s.score > 0);
            
            if (otherStudents.length > 0) {
                // Randomly select one or more students to give points to
                const numRecipients = Math.min(Math.floor(Math.random() * 3) + 1, otherStudents.length);
                const shuffled = otherStudents.sort(() => 0.5 - Math.random());
                const recipients = shuffled.slice(0, numRecipients);
                
                const pointsPerRecipient = Math.floor(pointsToGive / recipients.length);
                const remainder = pointsToGive % recipients.length;
                
                recipients.forEach((recipient, index) => {
                    const pointsToReceive = pointsPerRecipient + (index < remainder ? 1 : 0);
                    if (pointsToReceive > 0) {
                        // Find the recipient's socket ID and update their score
                        for (let [socketId, s] of students) {
                            if (s.username === recipient.username) {
                                s.score += pointsToReceive;
                                students.set(socketId, s);
                                break;
                            }
                        }
                    }
                });
                
                const recipientNames = recipients.map(r => r.name).join(', ');
                io.emit('activity_update', {
                    type: 'risky',
                    message: `🎁 ${student.name} gave ${pointsToGive} points to ${recipientNames}!`
                });
            } else {
                // No other students to give points to, just lose points
                io.emit('activity_update', {
                    type: 'risky',
                    message: `😬 ${student.name} lost ${Math.abs(randomPoints)} points (no one to give to)`
                });
            }
        } else {
            // 80% chance: random 0, 1, 3, 4, 5 points
            const possiblePoints = [0, 1, 3, 4, 5];
            randomPoints = possiblePoints[Math.floor(Math.random() * possiblePoints.length)];
            originalPoints = randomPoints;
            
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
            
            // Activity message
            const emoji = randomPoints > 0 ? '🎉' : randomPoints < 0 ? '😬' : '😐';
            const verb = randomPoints > 0 ? 'gained' : randomPoints < 0 ? 'lost' : 'got';
            io.emit('activity_update', {
                type: 'risky',
                message: `${emoji} ${student.name} risked it and ${verb} ${Math.abs(randomPoints)} points!`
            });
        }
        
        student.score = Math.max(0, student.score + randomPoints);
        student.interactions += 1;
        student.credits = (student.credits || 0) + 2;
        
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
    // NOW INCLUDES shielded players since shields can be broken
    const targets = Array.from(students.values())
      .filter(s => s.score > 0 && s.username !== student.username)
      .map(s => ({
        username: s.username,
        name: s.name,
        score: s.score,
        shielded: s.shielded || false
      }));
    
    console.log(`${student.name} requested steal targets. Found: ${targets.length}`);
    socket.emit('steal_targets', targets);
  });
  
  // Steal from specific target
  socket.on('steal_from_target', (data) => {
    const student = students.get(socket.id);
    if (!student || !gameActive) return;
    
    const { targetUsername } = data;
    const cost = 6;
    
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
    
    // NEW SHIELD LOGIC: If target has shield, break it but steal no points
    if (target.shielded) {
      // Break the shield
      target.shielded = false;
      target.shieldDuration = 0;
      
      // Thief still pays credits but gets no points
      student.credits -= cost;
      
      // Update both students
      students.set(targetSocketId, target);
      students.set(socket.id, student);
      
      console.log(`${student.name} broke ${target.name}'s shield`);
      
      // Broadcast shield break activity
      io.emit('activity_update', {
        type: 'shield',
        message: `💥 ${student.name} broke ${target.name}'s shield! No points stolen.`
      });
      
      socket.emit('powerup_bought', {
        powerup: 'shield_break',
        effect: `Broke ${target.name}'s shield (no points stolen)`,
        creditsLeft: student.credits
      });
      
      broadcastUpdate();
      return;
    }
    
    // Normal theft (no shield)
    const stolenPoints = Math.min(Math.floor(Math.random() * 3) + 3, target.score); // Steal 3, 4, or 5 points
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
        cost = 5;
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
      
      // Release the avatar
      releaseAvatar(student.avatar);
      
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
  
  // Send used avatars to new connections
  socket.on('request_used_avatars', () => {
    socket.emit('used_avatars', Array.from(usedAvatars));
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
  
  console.log('🎯 DEBUG - Broadcasting students with avatars:', sortedStudents.map(s => ({ name: s.name, avatar: s.avatar })));
  
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
