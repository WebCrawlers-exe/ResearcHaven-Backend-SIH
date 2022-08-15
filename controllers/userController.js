require('dotenv').config()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sendMail = require('../scripts/sendMail')
const { ObjectId } = require('mongodb')

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body
        const user = await User.findOne({ email })
        if (user) {
            return res.json({ success: false, message: "User Already Exists." })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ first_name, last_name, email, password: hashedPassword })
        if (!newUser) {
            return res.json({ success: false, message: "Error Creating User." })
        }
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET)
        const link = `${process.env.HOST}/api/user/verify/${token}`
        const mailInfo = await sendMail(email, link)
        if (!mailInfo) {
            return res.json({ success: false, message: "Error Creating User." })
        }
        return res.json({ success: true, message: "User Created Successfully." })
    } catch (error) {
        console.log(error)
        console.log(error.message);
        res.json({ success: false, message: "Some Internal Server Error Occured." })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User Not Found." })
        }
        if (!user.verified) {
            return res.json({ success: false, message: "User Not Verified." })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect Password." })
        }
        const data = { user: { _id: user._id } }
        const token = jwt.sign(data, process.env.JWT_SECRET)
        return res.json({ success: true, message: "User Logged In Successfully.", token })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Some Internal Server Error Occured." })
    }
}

const verifyUser = async (req, res) => {
    try {
        const token = req.params.token
        const data = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: data._id })
        if (!user) {
            return res.json({ success: false, message: "User Not Found." })
        }
        if (user.verified) {
            return res.json({ success: false, message: "User Already Verified." })
        }
        const updatedUser = await User.updateOne({ _id: user._id }, { $set: { verified: true } })
        if (!updatedUser) {
            return res.json({ success: false, message: "Error Verifying User." })
        }
        return res.send("<h1>User Verified Successfully.</h1><p>You can now <a href='/login'>login</a>.</p>")
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Some Internal Server Error Occured." })
    }
}

const sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User Not Found." })
        }
        if (user.verified) {
            return res.json({ success: false, message: "User Already Verified." })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
        const link = `${process.env.HOST}/api/user/verify/${token}`
        const mailInfo = await sendMail(user.email, link)
        if (!mailInfo) {
            return res.json({ success: false, message: "Error Sending Verification Email." })
        }
        return res.json({ success: true, message: "Verification Email Sent Successfully." })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Some Internal Server Error Occured." })
    }
}

module.exports = { createUser, loginUser, verifyUser, sendVerificationEmail }