import pool from '../config/connectDb.js';

export const saveUserOrders = async (req, res) => {
  const { orders, userId } = req.body;

  if (!orders || !Array.isArray(orders)) {
    return res.json({ success: false, message: "Invalid order format" });
  }


  try {
    let firstOrderId = null;

    for (const order of orders) {
      // Format dates for MySQL
      const orderDate = new Date(order.order_date || new Date())
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      
      const deliveryDate = order.delivery_date 
        ? new Date(order.delivery_date)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : null;


      // Prepare shipping address
      let shippingAddress = null;
      try {
        shippingAddress = typeof order.shipping_address === 'string'
          ? order.shipping_address
          : JSON.stringify(order.shipping_address || {});
      } catch (e) {
        shippingAddress = '{}';
      }

      const orderId  = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      if (!firstOrderId) firstOrderId = orderId;

      console.log(firstOrderId);
      
    
      await pool.query(
        `INSERT INTO user_orders 
         (id, adminid, productid, categoryid, user_id, order_date, delivery_date, total_amount, quantity, selected_size, selected_color, status, payment_method, is_paid, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [
          orderId,
          order.adminid || 1, // Default admin ID
          order.productid,
          order.categoryid || null,
          userId,
          orderDate,
          deliveryDate,
          order.total_amount,
          order.quantity || 1,
          order.selected_size || null,
          order.selected_color || null,
          order.status || 'pending',
          order.payment_method || null,
          order.is_paid ? 1 : 0,
          shippingAddress
        ]
      );
    }

    console.log("✅ Order saved with ID:", firstOrderId);

    return res.json({
      success: true,
      message: "Orders saved successfully",
      orderId: firstOrderId, 
    });
    

  } catch (error) {
    console.error("❌ Save order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
