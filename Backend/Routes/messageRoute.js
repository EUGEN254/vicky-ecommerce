import express from 'express';
import { getUserMessage, sendMessageToUser,deleteQuery, userQuery } from '../Controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post('/send-query', userQuery);
messageRouter.post('/response', sendMessageToUser)
messageRouter.get('/userQuery', getUserMessage)
messageRouter.delete('/delete/:id', deleteQuery);


export default messageRouter;
