import pool from "../config/connectDb.js";


export const sendUserOrders = async () => {
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      )
      return result.insertId
    
}








