const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const bcrypt = require('bcryptjs')


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedpassword });
        res.status(201).json({ user });
    }
    catch (error) {
        res.status(500).json({ msg: error.message })
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        )

        res.status(200).json({ token })
    }
    catch (error) {
        res.status(500).json({ msg: error.message })
    }
}
module.exports = { register, login }
