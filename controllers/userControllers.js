const User = require('../models/userModel');
const { validateName, validateEmail, validatePassword } = require('../utils/validator');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Register a new user
const register = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // Basic validation for user input
        if (!validateName(name) || !validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({
                status: 'error',
                message: 'Please enter all fields'
            });
        }

        // Check if user already exists with the given email
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already exists'
            });
        }

        // Encrypt the password before storing
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        // Create a new user record in the database
        user = await User.create({ name, email, password });

        // Generate JWT token for the newly registered user
        const payload = { userDetails: { id: user.id } };
        const bearerToken = await jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 3600000,
        });
    
        // Set a secure HTTP-only cookie with the JWT token
        res.status(201)
            .cookie('token_secret', bearerToken, {
                httpOnly: true,
                maxAge: 864_000_000, // 10 days
            }).json({
                status: 'success',
                message: `User registered with id ${user.id}}`,
                bearerToken
            });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: `Internal Server Error: ${error.message}`
        });
    }
};

// Login an existing user
const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Basic validation for login credentials
        if (!validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({
                status: 'error',
                message: 'Please enter all fields'
            });
        }

        // Check if the user exists in the database
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid Credentials'
            });
        }

        // Generate JWT token for the authenticated user
        const payload = { userDetails: { id: user.id } };
        const bearerToken = await jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 360000,
        });

        // Set a secure HTTP-only cookie with the JWT token
        res.status(200)
            .cookie('token_secret', bearerToken, {
                httpOnly: true,
                maxAge: 864_000_000, // 10 days
            }).json({
                status: 'success',
                message: `User logged in with email ${user.id}`,
                bearerToken
            });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: `Internal Server Error: ${error.message}`
        });
    }
};

// Logout a user
const logout = async (req, res) => {
    try {
        // Clear the JWT token cookie to log out the user
        res.status(200)
            .clearCookie('token_secret', {
                httpOnly: true,
                sameSite: 'None',
                maxAge: 0
            }).json({
                status: 'success',
                message: 'User logged out'
            });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: `Internal Server Error: ${error.message}`
        });
    }
};

module.exports = {
    register, 
    login, 
    logout
};
