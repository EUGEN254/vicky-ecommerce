import axios from 'axios';
import { generateAuthToken } from '../Middleware/mpesaAuth.js'; 
import pool from '../config/connectDb.js';

const backendUrl = 'https://a0052675bbc4.ngrok-free.app';
const MPESA_API_URL = 'https://sandbox.safaricom.co.ke';
const BUSINESS_SHORT_CODE = '174379';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const CALLBACK_URL = `${backendUrl}/mpesa/callback`;

export const initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    console.log("Initiating payment for order:", orderId);

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');
    const authToken = await generateAuthToken();

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: `254${phone.slice(-9)}`,
        PartyB: BUSINESS_SHORT_CODE,
        PhoneNumber: `254${phone.slice(-9)}`,
        CallBackURL: CALLBACK_URL,
        AccountReference: `Order-${orderId}`,
        TransactionDesc: 'Payment for order',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // Save mapping between CheckoutRequestID and orderId
    const checkoutId = response.data.CheckoutRequestID;
    console.log("hey check these ",checkoutId);
    
    if (checkoutId) {
      await pool.query(
        'INSERT INTO mpesa_checkout_map (checkout_id, order_id) VALUES (?, ?)',
        [checkoutId, orderId]
      );
    }

    res.json({
      success: true,
      message: 'Payment initiated',
      data: response.data,
    });
    console.log(data);
    
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message,
    });
  }
};

export const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("🔥 RAW CALLBACK:", JSON.stringify(callbackData, null, 2));

    const stk = callbackData.Body?.stkCallback;
    console.log("🔍 STK Object Keys:", Object.keys(stk));
    
    const checkoutId = stk?.CheckoutRequestID;
    console.log("🛒 CheckoutRequestID:", checkoutId);

    if (checkoutId) {
      const [rows] = await pool.query(
        'SELECT order_id FROM mpesa_checkout_map WHERE checkout_id = ?',
        [checkoutId]
      );
      console.log("📦 Database lookup results:", rows);
      
      if (rows.length > 0) {
        const orderId = rows[0].order_id;
        console.log("✅ Found matching order ID:", orderId);
        
        const updateResult = await pool.query(
          'UPDATE user_orders SET is_paid = 1, status = "paid" WHERE id = ?',
          [orderId]
        );
        console.log("🔄 Update result:", updateResult);
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error('❌ Callback Error:', error);
    res.status(500).end();
  }
};
