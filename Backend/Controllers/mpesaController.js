import axios from 'axios';
import { generateAuthToken } from '../Middleware/mpesaAuth.js';
import pool from '../config/connectDb.js';
import dotenv from 'dotenv';
dotenv.config();

const MPESA_API_URL = process.env.MPESA_BASE_URL;
const BUSINESS_SHORT_CODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;;

export const initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phone, amount, or orderId'
      });
    }

    console.log("📦 Initiating payment for order:", orderId);

    const [order] = await pool.query(
      'SELECT id, status FROM user_orders WHERE id = ?',
      [orderId]
    );

    if (order.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order[0].status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot initiate payment for cancelled order' });
    }

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

    const checkoutId = response.data?.CheckoutRequestID;

    if (!checkoutId) {
      throw new Error('M-Pesa request failed: No CheckoutRequestID received');
    }

    await pool.query(
      'INSERT INTO mpesa_checkout_map (checkout_id, order_id) VALUES (?, ?)',
      [checkoutId, orderId]
    );

    console.log('✅ Payment initiated:', response.data);

    return res.json({
      success: true,
      message: 'Payment initiated',
      data: response.data,
    });

  } catch (error) {
  console.error('🚨 STK Push Error:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    headers: error.response?.headers
  });
  }
};

export const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("🔥 RAW CALLBACK:", JSON.stringify(callbackData, null, 2));

    const stk = callbackData?.Body?.stkCallback;

    if (!stk) {
      console.warn("⚠️ No stkCallback found in body");
      return res.status(400).end();
    }

    const resultCode = parseInt(stk?.ResultCode);
    const resultDesc = stk?.ResultDesc;
    const checkoutId = stk?.CheckoutRequestID;

    console.log("📊 Payment Result:", {
      resultCode,
      resultDesc,
      checkoutId,
    });

    if (checkoutId) {
      const [rows] = await pool.query(
        'SELECT order_id FROM mpesa_checkout_map WHERE checkout_id = ?',
        [checkoutId]
      );

      if (rows.length > 0) {
        const orderId = rows[0].order_id;

        if (resultCode === 0) {
          console.log("✅ Payment SUCCESS for order:", orderId);
          await pool.query(
            'UPDATE user_orders SET is_paid = 1, status = "paid" WHERE id = ?',
            [orderId]
          );
        } else {
          const newStatus = resultDesc.toLowerCase().includes('cancelled') ? 'cancelled' : 'failed';
          console.log(`❌ Payment ${newStatus.toUpperCase()} for order:`, orderId, "Reason:", resultDesc);
          await pool.query(
            'UPDATE user_orders SET status = ? WHERE id = ?',
            [newStatus, orderId]
          );
        }
      } else {
        console.warn("⚠️ CheckoutRequestID not mapped to any order");
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

    await pool.query(
      'UPDATE user_orders SET status = "cancelled" WHERE id = ?',
      [orderId]
    );

    await pool.query(
      'UPDATE mpesa_checkout_map SET status = "cancelled" WHERE order_id = ?',
      [orderId]
    );

    console.log("❎ Payment manually cancelled for order:", orderId);

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
