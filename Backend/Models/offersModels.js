import pool from "../config/connectDb.js";

export const getOffers = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM exclusive_offers");
        return rows;
    } catch (error) {
        console.error("Error fetching offers:", error);
        throw error; // Re-throw to handle in controller
    }
};