import pool from "../config/connectDb.js";

export const getOffers = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT eo.*, c.name AS category_name 
            FROM exclusive_offers eo
            LEFT JOIN categories c ON eo.category_id = c.id
            ORDER BY eo.created_at DESC
          `);
        return rows;
    } catch (error) {
        console.error("Error fetching offers:", error);
        throw error; // Re-throw to handle in controller
    }
};