import pool from '../config/connectDb.js'

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
    const user = rows[0]

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    return res.json({
      success: true,
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        role: user.role
      }
    })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}


export const getUserInformation = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, email, password, isAccountVerified, createdAt FROM users`);
    
    if (!rows.length) {
      return res.json({ success: false, message: 'No users found' });
    }

    return res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const testimonials = async (req, res) => {

  const [rows] = await pool.query('SELECT * FROM testimonials');
  
  res.json({ success: true, data: rows });
};

