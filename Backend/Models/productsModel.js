import pool from '../config/connectDb.js';

export const createProduct = async ({
  id,
  name,
  category_id,
  price,
  features,
  images,
  sizes,
  colors,
  in_stock,
  owner_id,
  description
  
}) => {
  const [result] = await pool.query(
    `INSERT INTO products 
    (id, name, category_id,  price, features, images, sizes, colors, in_stock, owner_id,description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
    [
      id,
      name,
      category_id,
      price,
      JSON.stringify(features),
      JSON.stringify(images),
      JSON.stringify(sizes),
      JSON.stringify(colors),
      in_stock,
      owner_id,
      description
    ]
  );
  return result;
};



export const getAllProducts = async () => {
  const [rows] = await pool.query(
    `SELECT 
        p.*, 
        c.name AS category_name,
        c.id AS category_id,
        a.name AS owner_name,
        d.name AS discount_name,
        d.value AS discount_value,
        d.active AS discount_active
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN discounts d ON p.id = d.product_id
     LEFT JOIN admin a ON p.owner_id = a.id`
  );
  return rows;
};






export const toggleProductStock = async (productId) => {
  await pool.query(
    `UPDATE products SET in_stock = NOT in_stock WHERE id = ?`,
    [productId]
  );
};

