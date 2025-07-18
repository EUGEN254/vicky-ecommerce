import express from 'express'
import upload from '../Middleware/uploadMiddleware.js';
import { createProducts, exclusiveOffers,addExclusiveOffers,deleteExclusiveOffer, getProducts, toggleAvailability,getInventory,addInventory, updateProduct,deleteOrder  } from '../Controllers/productController.js';

import { adminAuth } from '../Middleware/adminAuth.js';
import { getCategories,deleteCategory,updateCategory,addCategory } from '../Models/Category.js';
import { applyDiscountToProduct } from '../Controllers/discountController.js';

const productRouter = express.Router();


productRouter.post('/', upload.array("images", 4),adminAuth,createProducts)
productRouter.put('/:id', updateProduct);
productRouter.delete('/orders/:id', deleteOrder);
productRouter.put('/:productId/discount', applyDiscountToProduct);
productRouter.put('/categories/:id/status', updateCategory );
productRouter.get('/inventory',getInventory);
productRouter.post('/inventory',addInventory);
productRouter.post('/toggle-availabilty', toggleAvailability);
productRouter.get('/',getProducts)
productRouter.get('/categories', getCategories);
productRouter.delete('/categories/:id', deleteCategory);
productRouter.post('/categories', addCategory);
productRouter.get('/exclusive_offers',exclusiveOffers)
productRouter.post('/exclusive', upload.array('images', 4),addExclusiveOffers)
productRouter.delete('/exclusive-offers/:id', deleteExclusiveOffer);





export default productRouter;