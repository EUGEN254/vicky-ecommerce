import pool from "../config/connectDb.js";


export const sendUserOrders = async () => {
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      )
      return result.insertId
    
}



export const getUserOrders = async (userId) => {
  try {
      const [rows] = await pool.query(`
          SELECT 
            o.*, 
            p.name AS product_name, 
            p.images AS product_images,
            c.name AS category_name 
          FROM user_orders o
          JOIN products p ON o.productid = p.id
          LEFT JOIN categories c ON o.categoryid = c.id
          WHERE o.user_id = ?;
        `, [userId]);
    return rows;
  } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
  }
};




