import axios from 'axios';
import { generateAuthToken } from '../Middleware/mpesaAuth.js'; 
import pool from '../config/connectDb.js';

const backendUrl = 'https://d7a25db21370.ngrok-free.app';
const MPESA_API_URL = 'https://sandbox.safaricom.co.ke';
const BUSINESS_SHORT_CODE = '174379';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const CALLBACK_URL = `${backendUrl}/mpesa/callback`;

export const initiateSTKPush = async (req, res) => {
  
  try {

    const { phone, amount, orderId } = req.body;
    // Validate input
    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phone, amount, or orderId'
      });
    }

    console.log("Initiating payment for order:", orderId);

     // Verify order exists
     const [order] = await pool.query(
      'SELECT id FROM user_orders WHERE id = ?',
      [orderId]
    );

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent STK push for cancelled orders
    if (order[0].status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot initiate payment for cancelled order'
      });
    }

    // proceed with stk push
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

    // Check for successful STK push initiation
    if (!response.data?.CheckoutRequestID) {
      throw new Error('M-Pesa request failed: No CheckoutRequestID received');
    }

    // Save mapping between CheckoutRequestID and orderId
    const checkoutId = response.data.CheckoutRequestID;
    console.log("hey check these ",checkoutId);
    
    if (checkoutId) {
      await pool.query(
        'INSERT INTO mpesa_checkout_map (checkout_id, order_id) VALUES (?, ?)',
        [checkoutId, orderId]
      );
    }

     // Log BEFORE sending response
     console.log('Payment initiated:', response.data);

    return res.json({
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
    console.log("🔥 RAW CALLBACK:", JSON.stringify(callbackData, null, 2));

    const stk = callbackData.Body?.stkCallback;
    console.log("🔍 STK Object Keys:", Object.keys(stk));
    
    const checkoutId = stk?.CheckoutRequestID;
    console.log("🛒 CheckoutRequestID:", checkoutId);
    
    // 1. Check if this is a successful payment (ResultCode 0 = success)
    const resultCode = stk?.ResultCode;
    const resultDesc = stk?.ResultDesc;
    
    console.log("📊 Payment Result:", {
      code: resultCode,
      description: resultDesc
    });

     // Determine status based on result code
    let status;
    if (resultCode === 0) {
      status = 'paid';
    } else if (resultDesc.includes('cancelled')) {
      status = 'cancelled';
    } else {
      status = 'failed';
    }

    if (checkoutId) {
      const [rows] = await pool.query(
        'SELECT order_id FROM mpesa_checkout_map WHERE checkout_id = ?',
        [checkoutId]
      );
      
      if (rows.length > 0) {
        const orderId = rows[0].order_id;
        
        // 2. Only update if payment was successful
        if (resultCode === '0') {
          console.log("✅ Payment SUCCESS for order:", orderId);
          await pool.query(
            'UPDATE user_orders SET is_paid = 1, status = "paid" WHERE id = ?',
            [orderId]
          );
        } else {
          // 3. Handle failed payment (optional: update status to 'failed')
          console.log("❌ Payment FAILED for order:", orderId, "Reason:", resultDesc);
          await pool.query(
            'UPDATE user_orders SET status = "failed" WHERE id = ?',
            [orderId]
          );
        }
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error('❌ Callback Error:', error);
    res.status(500).end();
  }
};


export const cancelSTKPush = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get the checkout request ID first
    const [checkout] = await pool.query(
      'SELECT checkout_id FROM mpesa_checkout_map WHERE order_id = ?',
      [orderId]
    );

    if (checkout.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    const checkoutId = checkout[0].checkout_id;

    // Update database first
    await pool.query(
      'UPDATE user_orders SET status = "cancelled" WHERE id = ?',
      [orderId]
    );

    await pool.query(
      'UPDATE mpesa_checkout_map SET status = "cancelled" WHERE order_id = ?',
      [orderId]
    );

    return res.json({
      success: true,
      message: 'Payment successfully cancelled'
    });

  } catch (error) {
    console.error('Cancellation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payment',
      error: error.message
    });
  }
};