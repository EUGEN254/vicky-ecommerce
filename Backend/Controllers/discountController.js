import { v4 as uuidv4 } from 'uuid';
import db from '../config/connectDb.js'; 

export const applyDiscountToProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, value, active } = req.body;

  try {
    // Check if discount already exists
    const [existing] = await db.query('SELECT * FROM discounts WHERE product_id = ?', [productId]);

    if (existing.length > 0) {
      // Update
      await db.query(
        'UPDATE discounts SET name = ?, value = ?, active = ?, updatedAt = NOW() WHERE product_id = ?',
        [name, value, active, productId]
      );
    } else {
      // Create
      const discountId = uuidv4();
      await db.query(
        'INSERT INTO discounts (id, product_id, name, value, active) VALUES (?, ?, ?, ?, ?)',
        [discountId, productId, name, value, active]
      );
    }

    res.json({ success: true, message: 'Discount applied successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to apply discount.' });
  }
};
