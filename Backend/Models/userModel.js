// models/userModel.js
import pool from '../config/connectDb.js'

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0]
}

export const createUser = async ({ name, email, password, termsAccepted }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, termsAccepted) VALUES (?, ?, ?, ?)',
    [name, email, password, termsAccepted ? 1 : 0]
  );
  return result.insertId;
};

