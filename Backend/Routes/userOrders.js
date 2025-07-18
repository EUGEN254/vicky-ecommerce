import express from 'express'
import { getOrders, getOrderById ,getUserOrders,deleteUserOrders,updateUserOrders} from '../Controllers/productController.js';
import { saveUserOrders } from '../Controllers/saveUserOrders.js';

const userOrders = express.Router();

userOrders.get('/', getOrders);
userOrders.get('/orders', getUserOrders);
userOrders.delete('/orders/:id', deleteUserOrders);
userOrders.put('/orders/:id/status', updateUserOrders);
userOrders.get('/:id', getOrderById); 
userOrders.post('/', saveUserOrders);

export default userOrders;