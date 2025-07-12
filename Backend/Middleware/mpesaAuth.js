import axios from 'axios';

const CONSUMER_KEY = 'sjmD6CR5fDigdSStWXYDxlGXZXJb7gvbyuviKZxlpz3yQQGq';
const CONSUMER_SECRET = 'V2gXgZti6gcfbL8Y0unA7mJAexS12Lm61Gy0DfVdFCGvBN8LV2AdKqCTPmZ1ituq';
const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

export const generateAuthToken = async () => {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(MPESA_AUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Auth Error:', error);
    throw error;
  }
};