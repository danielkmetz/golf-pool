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
const User = require('./models/users');
const LocalStrategy = require('passport-local').Strategy;
const connectUserDB = require('./Config/userDB');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');

connectUserDB();

const secret = uuid();
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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

app.use('/api/userpicks', userPicksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/register', registerRoute);
app.use('/api/charge', stripeRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
