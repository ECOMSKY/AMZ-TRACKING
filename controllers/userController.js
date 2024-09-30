const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    try {
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { user: email,role : "admin" },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
    
            console.log('Login successful for user:', email);
            return res.send({ userId:'admin',token : token });
        }

        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(200).json({status : false, message: 'Please check your email and password!😥' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(200).json({status : false, message: 'Please check your password!🫨' });
        }

        const token = jwt.sign(
            { user: { id: user._id },role : "user" },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful for user:', user.email);
        return res.json({ status : true,userId : user._id, token : token,message: 'Successfully login!😃' });
    } catch (err) {
        console.error('Server error during login:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(200).json({status : false, message: 'User already exists' });
        }

        user = new User({ username : username.toLowerCase(), email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const token = jwt.sign(
            { user: { id: user.id } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({status : true, userId : user._id, token : token, message: 'User registered successfully' });
    } catch (err) {
        console.error('Server error during signup:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({status : true , data: user});
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            console.log('Password updated for user:', user.username);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};