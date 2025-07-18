import pool from '../config/connectDb.js';

export const saveUserOrders = async (req, res) => {
  const { orders, userId } = req.body;
  const adminId = 1;

  if (!orders || !Array.isArray(orders)) {
    return res.json({ success: false, message: "Invalid order format" });
  }


  try {
    let firstOrderId = null;

    for (const order of orders) {
      const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      if (!firstOrderId) firstOrderId = id;

      console.log(firstOrderId);
      
    
      await pool.query(
        `INSERT INTO user_orders 
         (id, adminid, productid, categoryid, user_id, order_date, delivery_date, total_amount, quantity, selected_size, selected_color, status, payment_method, is_paid, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [
          id,
          adminId,
          order.productid,
          order.categoryid,
          userId,
          order.order_date,
          order.delivery_date,
          order.total_amount,
          order.quantity,
          order.selected_size,
          order.selected_color,
          order.payment_method,
          order.is_paid ? 1 : 0,
          typeof order.shipping_address === 'string' ? order.shipping_address : JSON.stringify(order.shipping_address)
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
