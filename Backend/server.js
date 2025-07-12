import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import pool from './config/connectDb.js'
import authRouter from './Routes/authRoutes.js'
import userRouter from './Routes/userRoutes.js'
import router from './Routes/adminRoutes.js'
import adminRouter from './Routes/adminRoute.js'
import dialogflowRoute from './HelpCenter/dialogFlowRute.js'
import productRouter from './Routes/productRoute.js'
import connectCloudinary from '../Backend/config/cloudinary.js'
import userOrders from './Routes/userOrders.js'
import dashboardRoute from './Routes/dashboardRoute.js'
import messageRouter from './Routes/messageRoute.js'
import settingsRouter from './Routes/settingsRoute.js'
import mpesaRoute from './Routes/mpesaRoute.js'





const app = express();
const port = process.env.port || 4000;
connectCloudinary();



const allowedOrigins = ['http://localhost:5173']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: allowedOrigins,credentials:true}))
app.use(express.urlencoded({ extended: true })); 


// API endoints
app.get('/',(req,res)=> res.send('API WORKING fine Mrs Bitinyo'));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', router )
app.use('/api/products', productRouter)
app.use('/api/orders', userOrders)
app.use('/api/dashboard', dashboardRoute)
app.use('/api/adminauth', adminRouter )
app.use('/api/chatbot', dialogflowRoute);
app.use('/api/messages', messageRouter);
app.use('/api/settings', settingsRouter);
app.use('/mpesa', mpesaRoute);


const startServer = async () => {
    try {
      const connection = await pool.getConnection()
      console.log('✅ Database connected')
      connection.release()
  
      app.listen(port, () => {
        console.log(`🚀 Server started on PORT: ${port}`)
      })
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      process.exit(1)
    }
  }
  
startServer()