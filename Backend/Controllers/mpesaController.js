import axios from 'axios';
import { generateAuthToken } from '../Middleware/mpesaAuth.js'; 
import pool from '../config/connectDb.js';

const backendUrl = 'https://24adea6f8ce2.ngrok-free.app';
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

    // Prepare M-Pesa request
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    
    const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`)
      .toString('base64');
    
    const authToken = await generateAuthToken();

    // Format phone number (ensure 254 prefix)
    const formattedPhone = phone.startsWith('254') ? phone : `254${phone.slice(-9)}`;

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORT_CODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: `Order-${orderId}`,
        TransactionDesc: 'Payment for order',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    // Check for successful STK push initiation
    if (!response.data?.CheckoutRequestID) {
      throw new Error('M-Pesa request failed: No CheckoutRequestID received');
    }

    const checkoutId = response.data.CheckoutRequestID;

    // Save the mapping
    await pool.query(
      'INSERT INTO mpesa_checkout_map (checkout_id, order_id) VALUES (?, ?)',
      [checkoutId, orderId]
    );

    return res.json({
      success: true,
      message: 'Payment initiated successfully',
      checkoutRequestId: checkoutId,
      merchantRequestId: response.data.MerchantRequestID,
      orderId: orderId
    });

  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data?.errorMessage || error.message,
    });
  }
};

export const mpesaCallback = async (req, res) => {
  let transactionStatus = 'failed';
  
  try {
    const callbackData = req.body;
    
    if (!callbackData.Body?.stkCallback) {
      console.error('Invalid callback format:', callbackData);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid callback format' 
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData.Body.stkCallback;
    
    // Check for successful payment
    if (ResultCode === '0') {
      transactionStatus = 'completed';
      
      // Get the amount paid from callback metadata
      let amount = 0;
      if (CallbackMetadata?.Item) {
        const amountItem = CallbackMetadata.Item.find(item => item.Name === 'Amount');
        if (amountItem) amount = amountItem.Value;
      }

      // Find the associated order
      const [mapping] = await pool.query(
        'SELECT order_id FROM mpesa_checkout_map WHERE checkout_id = ?',
        [CheckoutRequestID]
      );

      if (mapping.length > 0) {
        const orderId = mapping[0].order_id;
        
        // Update order status
        await pool.query(
          `UPDATE user_orders 
           SET is_paid = 1, 
               status = 'paid',
               payment_method = 'Mpesa',
               updated_at = NOW()
           WHERE id = ?`,
          [orderId]
        );

        // Record transaction details (optional)
        await pool.query(
          `INSERT INTO mpesa_transactions 
           (checkout_id, order_id, amount, status, result_code, result_desc)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [CheckoutRequestID, orderId, amount, transactionStatus, ResultCode, ResultDesc]
        );
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Callback processing error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error processing callback',
      error: error.message
    });
  }
};
