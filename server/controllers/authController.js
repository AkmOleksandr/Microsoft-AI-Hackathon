const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function signup(req, res) {
    try {
        const { username, password } = req.body;
        // Check if the user already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User(username, passwordHash);
        await newUser.save();

        res.json({ message: 'User registered successfully' });
  } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Generate a JWT
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    signup,
    login,
};
