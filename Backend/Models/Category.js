import pool from '../config/connectDb.js';
import { v4 as uuidv4 } from 'uuid';



export const addCategory = async (req, res) => {
  const { name, owner_id } = req.body;

  if (!name) return res.json({ success: false, message: "Category name required" });

  const id = uuidv4();
  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    await pool.query(
      `INSERT INTO categories (id, name, status, owner_id, createdAt, updatedAt) 
       VALUES (?, ?, 'Active', ?, ?, ?)`,
      [id, name, owner_id, createdAt, updatedAt]
    );

    return res.json({ success: true, message: 'Category added successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id AS _id, name, status 
      FROM categories
    `);
    res.json({ 
      success: true, 
      data: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};





export const getCategoryById = async (categoryId) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE _id = ?', [categoryId]);
  return rows[0];
};



export const updateCategory = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    const [result] = await pool.query(
      `UPDATE categories SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
