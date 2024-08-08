require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const userPicksRoutes = require('./routes/userPicks');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const registerRoute = require('./routes/register');
const stripeRoute = require('./routes/stripe');
const liveRoute = require('./routes/liveResults')
const leaderboardRoute = require('./routes/leaderboard');
const oddsRoute = require('./routes/odds');
const picsRoute = require('./routes/profilePics');
const scheduleRoute = require('./routes/schedule');
const tutorial = require('./routes/tutorial');
const createPool = require('./routes/createPool');
const http = require('http');
const socketIo = require('socket.io').Server;
const Message = require('./models/messages');
const User = require('./models/users');
const LocalStrategy = require('passport-local').Strategy;
const connectUserDB = require('./Config/userDB');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pastResults = require('./routes/pastResults');
const twilio = require('./routes/twilio');
const payouts = require('./routes/sendPayments');
const balance = require('./routes/accountBalance');
const { uuid } = require('uuidv4');

connectUserDB();

const secret = uuid();
const app = express();

const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinPool', (poolName) => {
      socket.join(poolName);
      console.log(`User joined pool: ${poolName}`);
  });

  socket.on('chatMessage', async (msg) => {
      console.log('Received chat message:', msg);
      const newMessage = new Message({
          username: msg.username,
          message: msg.message,
          poolName: msg.poolName,
      });
      try {
          await newMessage.save();
          io.to(msg.poolName).emit('chatMessage', {
              username: newMessage.username,
              message: newMessage.message,
              poolName: newMessage.poolName
          });
          console.log('Emitted chat message to pool:', msg.poolName);
      } catch (err) {
          console.error('Error saving message:', err);
      }
  });

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});

app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  console.log('Received POST request to /api/login');
  const token = jwt.sign({ username: req.user.username }, secret, { expiresIn: '1h' });
  res.setHeader('Content-Type', 'application/json');
  res.json({ message: 'Login successful', token });
});

app.put('/api/users/:username', async (req, res) => {
  const { newUsername } = req.body;
  const username = req.params.username;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.username = newUsername;
    await user.save();
    const existingToken = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the Authorization header
    console.log(existingToken);
    // Verify the existing token
    const decoded = jwt.verify(existingToken, secret);

    // Update the payload with the new username
    decoded.username = newUsername;

    // Generate a new token with the updated payload
    const token = jwt.sign({ username: newUsername}, secret, { expiresIn: '1h' });

    res.json({ username: newUsername, token: token });
  } catch (error) {
    // Handle errors
    console.error('Error updating username:', error);
    res.status(500).json({ success: false, message: 'Failed to update username' });
  }
}); 

app.use('/api/userpicks', userPicksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/register', registerRoute);
app.use('/api/charge', stripeRoute);
app.use('/api/liveResults', liveRoute);
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/golfer-odds', oddsRoute);
app.use('/api/profile-pics', picsRoute);
app.use('/api/schedule', scheduleRoute);
app.use('/api/video-tutorial', tutorial);
app.use('/api/create-pool', createPool);
app.use('/api/past-results', pastResults);
app.use('/api/payouts', payouts);
app.use('/api/twilio', twilio);
app.use('/api/balance', balance);

app.post('/api/chat', async (req, res) => {
  try {
    const { username, message, poolName } = req.body;

    // Create a new message instance
    const newMessage = new Message({
      username,
      message,
      poolName,
    });

    // Save the message to the database
    await newMessage.save();

    // Emit the message to all clients in the same pool
    io.to(poolName).emit('chatMessage', newMessage);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

app.get('/api/chat', async (req, res) => {
  try {
    const { poolName } = req.query;

    // Fetch messages from the database for the specified poolName
    const messages = await Message.find({ poolName }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

app.put('/api/chat/update-username/:username', async (req, res) => {
  try {
    const oldUsername = req.params.username
    const { newUsername } = req.body;

    if (!oldUsername || !newUsername) {
      return res.status(400).json({ success: false, message: 'Both oldUsername and newUsername are required' });
    }

    // Update all messages with the old username to the new username
    const result = await Message.updateMany({ username: oldUsername }, { username: newUsername });

    if (result.nModified > 0) {
      res.status(200).json({ success: true, message: 'Username updated successfully on all messages' });
    } else {
      res.status(404).json({ success: false, message: 'No messages found for the old username' });
    }
  } catch (error) {
    console.error('Error updating username on messages:', error);
    res.status(500).json({ success: false, message: 'Failed to update username on messages' });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
