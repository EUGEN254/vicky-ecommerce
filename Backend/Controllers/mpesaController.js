import axios from 'axios';
import { generateAuthToken } from '../Middleware/mpesaAuth.js'; 
import pool from '../config/connectDb.js';


const backendUrl = process.env.BACKEND_URL;
const MPESA_API_URL = 'https://sandbox.safaricom.co.ke'; // Use production URL when live
const BUSINESS_SHORT_CODE = 'YOUR_SHORTCODE';
const PASSKEY = 'YOUR_PASSKEY';
const CALLBACK_URL = `${backendUrl}/mpesa/callback`;

export const initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    
    const password = Buffer.from(
      `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`
    ).toString('base64');

    const authToken = await generateAuthToken();

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: `254${phone.slice(-9)}`, // Convert to 254 format
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

    res.json({
      success: true,
      message: 'Payment initiated',
      data: response.data,
    });
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
      
      if (callbackData.Body.stkCallback.ResultCode === 0) {
        // Successful payment
        const orderId = callbackData.Body.stkCallback.CheckoutRequestID.split('_')[0];
        
        // Update the order in MySQL
        await pool.query(
          'UPDATE user_orders SET is_paid = ? WHERE id = ?',
          [true, orderId]
        );
        
        // You might want to send a confirmation email here
      }
  
      res.status(200).end();
    } catch (error) {
      console.error('Callback Error:', error);
      res.status(500).end();
    }
  };