const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/Users');

// @route   GET api/users/test
// @desc    Test users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Users works"}));

// @route   GET api/users/register
// @desc    Register an artist
// @access  Public
router.post('/register', (req, res) => {

    // Check validation
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Check is user exists, if not then register the user.
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log('err'));
                    })
                });
            }
        });
});

// @route   GET api/users/login
// @desc    Login an artist / Return JWT Token
// @access  Public
router.post('/login', (req, res) => {

    // Check validation
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find artist by email
    User.findOne({ email: email})
        .then(user => {
            // Check for artist
            if(!user){
                errors.email = 'Artist not found'
                return res.status(404).json(errors);
            }
            // Check password
            bcrypt.compare(password, user.password)
                .then( pwMatch => {
                    if(pwMatch){
                        // Artist matched
                        const payload = {
                            id: user.id,
                            name: user.name,
                        };

                        // Sign token
                        jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
});

module.exports = router;