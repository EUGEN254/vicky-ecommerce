import pool from '../config/connectDb.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Verify admin credentials
    const [rows] = await pool.query(
      'SELECT * FROM admin WHERE email = ?', 
      [email]
    );
    
    const admin = rows[0];
    
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. Verify password (use bcrypt.compare)
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: admin.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 4. Set HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // 5. Respond with success
    res.json({
      success: true,
      message: "Login successful",
      token, // For localStorage
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};


export const Logout = async (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out' });
}