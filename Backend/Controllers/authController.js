import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/connectDb.js'
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE, WELCOME_TEMPLATE } from '../config/emailTemplates.js'
import { findUserByEmail, createUser } from '../Models/userModel.js'

// 🟢 Register
export const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' })
  }

  try {
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = await createUser({ name, email, password: hashedPassword })

    const token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // required for cross-site with SameSite=None
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome!',
      text: `Hi ${name}, your account was created.`
    })

    return res.json({ success: true, message: 'Successfully Registered' })

  } catch (err) {
    return res.json({ success: false, message: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' })
  }

  try {
    const user = await findUserByEmail(email)
    if (!user) return res.json({ success: false, message: 'Invalid email' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.json({ success: false, message: 'Invalid password' })

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // required for cross-site with SameSite=None
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({ success: true, message: 'Logged in', user: { name: user.name, email: user.email } })

  } catch (err) {
    return res.json({ success: false, message: err.message })
  }
}

// 🟢 Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // required for cross-site with SameSite=None
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({ success: true, message: 'Successfully Logged Out' })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// 🟢 Send Account Verification OTP
export const sendVerifyOtp = async (req, res) => {
  const userId = req.userId

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
    const user = users[0]

    if (!user) return res.json({ success: false, message: 'User not found' })
    if (user.isAccountVerified) return res.json({ success: false, message: 'Already verified' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expire = Date.now() + 24 * 60 * 60 * 1000

    await pool.query('UPDATE users SET verifyOtp = ?, verifyOtpExpireAt = ? WHERE id = ?', [otp, expire, userId])

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account verification OTP',
      html: EMAIL_VERIFY_TEMPLATE.replace('{otp}', otp).replace('{email}', user.email)
    })

    return res.json({ success: true, message: 'Verification OTP sent to email' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// 🟢 Verify Email OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body
  const userId = req.userId

  if (!otp || !userId) return res.json({ success: false, message: 'Missing details' })

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
    const user = users[0]

    if (!user) return res.json({ success: false, message: 'User not found' })
    if (user.verifyOtp !== otp) return res.json({ success: false, message: 'Invalid OTP' })
    if (user.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: 'OTP expired' })

    await pool.query(`
      UPDATE users 
      SET isAccountVerified = 1, verifyOtp = '', verifyOtpExpireAt = 0 
      WHERE id = ?
    `, [userId])

    return res.json({ success: true, message: 'Email verified successfully' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// 🟢 Check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// 🟢 Send Reset Password OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body
  if (!email) return res.json({ success: false, message: 'Email is required' })

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const user = users[0]
    if (!user) return res.json({ success: false, message: 'User not found' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expire = Date.now() + 15 * 60 * 1000

    await pool.query('UPDATE users SET resetOtp = ?, resetOtpExpireAt = ? WHERE email = ?', [otp, expire, email])

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      html: PASSWORD_RESET_TEMPLATE.replace('{otp}', otp).replace('{email}', email)
    })

    return res.json({ success: true, message: 'Reset OTP sent to email' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// 🟢 Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'All fields are required' })
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const user = users[0]
    if (!user) return res.json({ success: false, message: 'User not found' })
    if (user.resetOtp !== otp) return res.json({ success: false, message: 'Invalid OTP' })
    if (user.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: 'OTP expired' })

    const hashed = await bcrypt.hash(newPassword, 10)

    await pool.query(`
      UPDATE users 
      SET password = ?, resetOtp = '', resetOtpExpireAt = 0 
      WHERE email = ?
    `, [hashed, email])

    return res.json({ success: true, message: 'Password has been reset successfully' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}
