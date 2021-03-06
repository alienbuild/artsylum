const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validator
const validateProfileInput = require('../../validation/profile');

// Load profile model
const Profile = require('../../models/Profile');

// Load user model
const User = require('../../models/Users');

// @route   GET api/profile/test
// @desc    Test profile route
// @access  Public
router.get('/test', (req,res) => res.json({msg: "Profile works"}));

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no profile for this user.';
                return res.status(400).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

    // Validate POST
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
        // If invalid then return errors
        return res.status(400).json(errors);
    }

    // Grab fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    // Skills - Split into array
    if(typeof req.body.skills !== 'undefined'){
     profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) {
                // Update profile
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
                    .then(profile => { res.json(profile) });
            } else {
                // Create profile

                // Does handle already exist?
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile){
                            errors.handle = 'That handle already exists.';
                            res.status(400).json(errors);
                        }

                        // Save Profile
                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));
                    });
            }
        });

});

module.exports = router;