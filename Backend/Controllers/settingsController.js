import pool from '../config/connectDb.js'



export const getSiteConfig = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT maintenance_mode  FROM site_config ");
        const maintenance = result[0]?.maintenance_mode === 1;
        res.json({ maintenance });
      } catch (error) {
        res.status(500).json({ message: "Error fetching maintenance status" });
      }
};
  
export const updateMaintenanceMode = async (req, res) => {
    const { maintenance } = req.body;
    await pool.query('UPDATE site_config SET maintenance_mode = ? LIMIT 1', [maintenance]);
    res.json({ success: true, message: `Frontend is now ${maintenance ? 'disabled' : 'enabled'}` });
};

export const updateEmailMode = async (req, res) => {
  try {
    const { email_notifications } = req.body; // Note the field name matches what you're sending
    
    // Update in database - make sure to use the correct column name
    await pool.query('UPDATE site_config SET email_notifications = ? LIMIT 1', [email_notifications]);
    
    res.json({ 
      success: true, 
      message: `Email notifications are now ${email_notifications ? 'enabled' : 'disabled'}` 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
  