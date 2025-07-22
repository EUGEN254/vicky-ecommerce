import pool from "../config/connectDb.js";

export const dashboard = async () => {
  try {
    // Count total products
    const [productCount] = await pool.execute('SELECT COUNT(*) as totalProducts FROM products');

    // Sum total revenue
    const [totalRevenueResult] = await pool.execute('SELECT SUM(total_amount) as totalRevenue FROM user_orders');

    // Get recent orders + join product name
    const [orders] = await pool.execute(`
      SELECT 
        uo.id, uo.total_amount, uo.status, uo.productid, p.name AS product_name
      FROM user_orders uo
      JOIN products p ON uo.productid = p.id
      ORDER BY uo.created_at DESC
      LIMIT 10
    `);

    const user_orders = orders.map(order => ({
      _id: order.id,
      totalAmount: order.total_amount,
      status: order.status,
      products: [{ name: order.product_name }]
    }));

    // Get monthly product count
    const [productsByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(createdAt, '%b %Y') AS month,
        COUNT(*) AS productCount
      FROM products
      WHERE createdAt IS NOT NULL
      GROUP BY DATE_FORMAT(createdAt, '%b %Y')
      ORDER BY MIN(createdAt)
    `);

    // Get monthly revenue
    const [revenueByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(order_date, '%b %Y') AS month,
        SUM(total_amount) AS totalRevenue
      FROM user_orders
      WHERE order_date IS NOT NULL
      GROUP BY DATE_FORMAT(order_date, '%b %Y')
      ORDER BY MIN(order_date)
    `);

    return {
      totalProducts: productCount[0].totalProducts,
      totalRevenue: totalRevenueResult[0].totalRevenue || 0,
      user_orders,
      productsByMonth,
      revenueByMonth
    };

  } catch (error) {
    console.error("Dashboard error:", error);
    throw error; // Let the controller catch and handle this
  }
};
