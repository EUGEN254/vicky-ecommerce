// models/userModel.js
import pool from '../config/connectDb.js'

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0]
}

export const createUser = async ({ name, email, password }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  )
  return result.insertId
}


