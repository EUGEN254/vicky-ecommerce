import jwt from 'jsonwebtoken';
import pool from '../config/connectDb.js';

export const adminAuth = async (req, res, next) => {
  // Try to get token from both cookies and Authorization header
  const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authorization token required" 
    });
  }

  try {
    // Verify token
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check admin exists in database
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM admin WHERE id = ?', 
      [tokenDecode.id]
    );
    
    if (!rows.length) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin account not found" 
      });
    }

    const admin = rows[0];
    
    // Attach admin to request
    req.user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Specific error messages
    let message = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Malformed token';
    }

    return res.status(401).json({ 
      success: false, 
      message 
    });
  }
};