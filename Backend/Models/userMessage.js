import pool from '../config/connectDb.js';

export const createMessage = async (messages) => {
  const [result] = await pool.query(
    'INSERT INTO messages (_id, names, email, description, createdAt) VALUES (?, ?, ?, ?, ?)',
    [messages._id, messages.names, messages.email, messages.description, messages.createdAt]
  );
  return result.insertId;
};

export const getUserQuery = async () =>{
    try {
        const [rows] = await pool.query("SELECT * FROM messages");
        return rows;
    } catch (error) {
        console.error("Error message:", error);
        throw error; // Re-throw to handle in controller
    }

}

