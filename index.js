const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3005;
const SECRET_KEY = 'your-secret-key'; // Replace with your secret key

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory user store
const users = {};
const questions = [
    {
        id: 1,
        title: 'What is React?',
        description: 'Explain React and its features.',
        tags: ['JavaScript', 'Frontend'],
        answers: [{ text: 'React is a library for building UIs.' }],
        views: 10,
        answered: 1,
    },
    {
        id: 2,
        title: 'What is Node.js?',
        description: 'Describe Node.js architecture.',
        tags: ['JavaScript', 'Backend'],
        answers: [{ text: 'Node.js is a runtime for executing JS code server-side.' }],
        views: 8,
        answered: 1,
    },
];

// Function to generate JWT
const generateToken = (username) => {
    return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = hashedPassword;

    res.status(201).json({ message: 'Registration successful' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const userPassword = users[username];
    if (!userPassword || !(await bcrypt.compare(password, userPassword))) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(username);
    res.json({ message: 'Login successful', token });
});

app.get('/questions', authenticateToken, (req, res) => {
    res.json(questions);
});

app.get('/status', authenticateToken, (req, res) => {
    res.json({ user: req.user.username });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
