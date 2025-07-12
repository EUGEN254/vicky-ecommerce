import pool from '../config/connectDb.js';

export const saveUserOrders = async (req, res) => {
  const { orders } = req.body;
  const adminId = 1; 

  if (!orders || !Array.isArray(orders)) {
    return res.json({ success: false, message: "Invalid order format" });
  }

  console.log("✅ Received orders:", orders); 

  try {
    for (const order of orders) {
      const {
        productid,
        categoryid,
        quantity,
        selected_size,
        selected_color,
        total_amount,
        order_date,
        delivery_date,
        is_paid,
        payment_method,
        shipping_address
      } = order;

      if (!productid) {
        console.error("❌ Skipping order - Missing productid:", order);
        continue;
      }

      const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await pool.query(
        `INSERT INTO user_orders 
         (id, adminid, productid, categoryid, order_date, delivery_date, total_amount, quantity, selected_size, selected_color, status, payment_method, is_paid, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [
          id,
          adminId,
          productid,
          categoryid,
          order_date,
          delivery_date,
          total_amount,
          quantity,
          selected_size,
          selected_color,
          payment_method,
          is_paid ? 1 : 0,
          JSON.stringify(shipping_address)
        ]
      );
    }

    return res.json({ success: true, message: "Orders saved successfully" });

  } catch (error) {
    console.error("❌ Save order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
