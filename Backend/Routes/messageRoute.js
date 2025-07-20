import express from 'express';
import { getUserMessage, sendMessageToUser,deleteQuery, userQuery } from '../Controllers/messageController.js';
import { subscribe,unsubscribe } from '../Controllers/subscription.js';

const messageRouter = express.Router();

messageRouter.post('/send-query', userQuery);
messageRouter.post('/response', sendMessageToUser)
messageRouter.get('/userQuery', getUserMessage)
messageRouter.delete('/delete/:id', deleteQuery);
messageRouter.post('/subscribe', subscribe);
messageRouter.get('/unsubscribe', unsubscribe);



export default messageRouter;
