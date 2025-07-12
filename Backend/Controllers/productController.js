import { v4 as uuidv4 } from 'uuid';
import { createProduct,getAllProducts } from '../Models/productsModel.js';
import {v2 as cloudinary} from 'cloudinary'
import { getOffers } from '../Models/offersModels.js';
import { getUserOrders } from '../Models/getUserOrders.js';
import { dashboard } from '../Models/dashboard.js';
import pool from '../config/connectDb.js';


export const createProducts = async (req, res) => {
  try {
    const {
      shoeType: name,
      price,
      sizes,
      colors,
      features,
      categoryId,
      description 
      
    } = req.body;

    console.log('Received description:', description);

    const parsedSizes = sizes.split(',').map(s => s.trim());
    const parsedColors = colors.split(',').map(c => c.trim());
    const parsedFeatures = JSON.parse(features);
    const createdAt = new Date();

    const imageUploadPromises = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(imageUploadPromises);

    const productId = uuidv4();
    const owner_id = req.user.id


    await createProduct({
      id: productId,
      name,
      category_id: categoryId, 
      price,
      features: parsedFeatures,
      images,
      sizes: parsedSizes,
      colors: parsedColors,
      in_stock: true,
      owner_id,
      createdAt ,
      description: description || ''
    });

    res.json({ success: true, message: 'Product added successfully!' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Product creation failed.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      colors,  // This is already an array from frontend
      sizes,   // This is already an array from frontend
      price
    } = req.body;

    // No need to split since frontend sends arrays
    const parsedColors = Array.isArray(colors) ? colors : [colors];
    const parsedSizes = Array.isArray(sizes) ? sizes : [sizes];

    
    
    try {
      // Update product in database
      const [result] = await pool.query(
        `UPDATE products 
         SET name = ?, colors = ?, sizes = ?, price = ?
         WHERE id = ?`,
        [
          name,
          JSON.stringify(parsedColors),
          JSON.stringify(parsedSizes),
          price,
          id
        ]
      );


      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Product updated successfully' });
      } else {
        res.json({ success: false, message: 'Product not found' });
      }
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.json({ 
      success: false, 
      message: 'Failed to update product',
      error: error.message 
    });
  }
};
export const getProducts =  async (req,res) => {
    try {
        const products = await getAllProducts();
      
        
        res.json({ success: true, data: products });
      } catch (err) {
        res.json({ success: false, message: 'Failed to fetch products' });
      }
    
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const [result] = await pool.query(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      
      
      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Product deleted successfully' });
      } else {
        res.json({ success: false, message: 'Product not found' });
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.json({ 
      success: false, 
      message: 'Failed to delete product',
      error: error.message 
    });
  }
};
export const exclusiveOffers = async (req, res) => {
  try {
    const offers = await getOffers();
    res.json({ success: true, data: offers });
  } catch (err) {
    console.error("Offers controller error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get exclusive offers",
      error: err.message 
    });
  }
}
export const getOrders = async (req, res) => {
  try {
    const orders = await getUserOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("UserOrders controller error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user orders",
      error: error.message 
    });
  }
}

export const getOrderById = async (orderId) => {
  try {
      const [rows] = await pool.query(`
          SELECT * FROM user_orders 
          WHERE id = ?;
        `, [orderId]);
    return rows[0];
  } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
  }
};

export const dashboardData = async (req,res) => {
  try {
    const dashBoardData = await dashboard();
    res.json({ success: true, data: dashBoardData });
  } catch (error) {
    console.error("dashBoardData controller error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user dashBoardData",
      error: error.message 
    });
  }
  
}

export const toggleAvailability = async (req, res) => {
  const { productId } = req.body;
  try {
    // Get current availability
    const [rows] = await pool.query('SELECT is_available, in_stock FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) return res.json({ success: false, message: 'Product not found' });

    const current = rows[0];
    const newAvailability = current.is_available === 1 ? 0 : 1;
    const newStock = newAvailability === 1 ? 1 : 0;

    await pool.query('UPDATE products SET is_available = ?, in_stock = ? WHERE id = ?', [newAvailability, newStock, productId]);

    res.json({ success: true, message: `Availability updated to ${newAvailability ? 'Available' : 'Unavailable'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating availability', error: error.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.stock,
        i.updated_at,
        p.name,
        i.product_id
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
};

export const addInventory = async (req, res) => {
  const { productId, stock } = req.body;

  if (!productId || stock === undefined)
    return res.json({ success: false, message: 'Product and stock required' });

  try {
    // Check if entry exists
    const [exists] = await pool.query(
      'SELECT * FROM inventory WHERE product_id = ?',
      [productId]
    );

    if (exists.length > 0) {
      // Update if exists
      await pool.query(
        'UPDATE inventory SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
        [stock, productId]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO inventory (product_id, stock) VALUES (?, ?)',
        [productId, stock]
      );
    }

    res.json({ success: true, message: 'Inventory updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating inventory' });
  }
};



