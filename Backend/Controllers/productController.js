import { v4 as uuidv4 } from 'uuid';
import { createProduct,getAllProducts } from '../Models/productsModel.js';
import {v2 as cloudinary} from 'cloudinary'
import { getOffers } from '../Models/offersModels.js';
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

export const addExclusiveOffers = async (req, res) => {
  try {
    const {
      title,
      description,
      price_off,
      original_price,
      price,
      expiry_date,
      colors,
      sizes,
      category_id: categoryId, 
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageUploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path)
    );
    const images = await Promise.all(imageUploadPromises);
    const imageUrls = images.map(img => img.secure_url);

    const [result] = await pool.query(
      `INSERT INTO exclusive_offers 
       (title, description, price_off, original_price, price, expiry_date, image, colors, sizes, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        price_off,
        original_price,
        price,
        expiry_date,
        JSON.stringify(imageUrls),
        Array.isArray(colors) ? colors.join(',') : colors,
        Array.isArray(sizes) ? sizes.join(',') : sizes,
        categoryId, 
      ]
    );

    res.status(201).json({
      message: 'Offer created',
      offerId: result.insertId,
      title,
      image: imageUrls
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
};

export const deleteExclusiveOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: check if the offer exists before deleting
    const [rows] = await pool.query(`SELECT * FROM exclusive_offers WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Delete the offer
    await pool.query(`DELETE FROM exclusive_offers WHERE id = ?`, [id]);

    res.status(200).json({ message: 'Offer deleted successfully', id });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
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

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM user_orders WHERE id = ?',
      [id]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete order', 
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
    const { userId } = req.query; 
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const [orders] = await pool.query(
      `SELECT uo.*, p.name AS product_name, c.name AS category_name, p.images AS product_images
       FROM user_orders uo
       LEFT JOIN products p ON uo.productid = p.id
       LEFT JOIN categories c ON uo.categoryid = c.id
       WHERE uo.user_id = ?
       ORDER BY uo.order_date DESC`,
      [userId]
    );

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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; 

    const [rows] = await pool.query(
      'SELECT is_paid, status FROM user_orders WHERE id = ?',
      [id]
    );

    if (rows.length > 0) {
      return res.json({ 
        order: {
          is_paid: rows[0].is_paid,
          status: rows[0].status
        } 
      });
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ message: "Server error" });
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

export const getUserOrders =async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
      o.*, 
      p.name AS product_name, 
      p.images AS product_images,  -
      u.name AS user_name,
      u.email AS user_email
      FROM user_orders o
      JOIN products p ON o.productid = p.id
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const deleteUserOrders = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM user_orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};


export const updateUserOrders = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled','paid'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE user_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const updateFailedOrder = async (req, res) => {
  const { id } = req.params;
  const {
    payment_method,
    shipping_address,
    is_paid = false
  } = req.body;

  try {
    // Validate required fields
    if (!id || !payment_method || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Parse shipping_address
    let parsedShippingAddress;
    try {
      parsedShippingAddress = typeof shipping_address === 'string' 
        ? JSON.parse(shipping_address) 
        : shipping_address;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address format'
      });
    }

    // Validate shipping address
    if (!parsedShippingAddress.name || !parsedShippingAddress.phone || 
        !parsedShippingAddress.address || !parsedShippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address incomplete'
      });
    }

    // Prepare update data
    const updateData = {
      payment_method,
      shipping_address: JSON.stringify(parsedShippingAddress),
      is_paid,
      status: is_paid ? 'paid' : 'pending',
      updated_at: new Date()
    };

    // Build SQL query
    let sql = `UPDATE user_orders SET 
      payment_method = ?,
      shipping_address = ?,
      is_paid = ?,
      status = ?,
      updated_at = ?`;
    
    const params = [
      updateData.payment_method,
      updateData.shipping_address,
      updateData.is_paid,
      updateData.status,
      updateData.updated_at
    ];

    // Add delivery_date if is_paid is true
    if (is_paid) {
      sql += `, delivery_date = IF(ISNULL(delivery_date), ?, delivery_date)`;
      params.push(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    // Execute update
    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Return updated order
    const [updatedOrder] = await pool.execute(
      `SELECT * FROM user_orders WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      order: updatedOrder[0]
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


