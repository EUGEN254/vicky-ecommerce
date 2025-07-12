import pool from '../config/connectDb.js'


export const getAdminData = async (req, res) => {

   try {
    const userId = req.user.id 
  
      const [rows] = await pool.query('SELECT * FROM Admin WHERE id = ?', [userId])
      const user = rows[0]
  
      if (!user) {
        return res.json({ success: false, message: 'User not found' })
      }
  
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      return res.json({ success: false, message: error.message })
    }
  
}
