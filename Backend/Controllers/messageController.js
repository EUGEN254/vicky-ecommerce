import transporter from '../config/nodemailer.js';
import { MESSAGE_RESPONSE_TEMPLATE } from '../config/emailTemplates.js';
import { createMessage, getUserQuery } from '../Models/userMessage.js';
import { v4 as uuidv4 } from 'uuid';
import handlebars from 'handlebars';
import pool from '../config/connectDb.js'

export const userQuery = async (req, res) => {
  try {
    const { names, email, description } = req.body;

    if (!names || !email || !description) {
      return res.json({ success: false, message: "Missing details" });
    }

    const messageId = uuidv4();
    const createdAt = new Date();

    // Save user query only — not response
    await createMessage({
      _id: messageId,
      names,
      email,
      description,
      createdAt,
      response: null
    });

    // Send confirmation email to user
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Your query has been received',
      text: `We will respond to you as soon as possible`,
    };
    await transporter.sendMail(mailOptions);

    // Check if email notifications are enabled
    const [settings] = await pool.query('SELECT email_notifications FROM site_config LIMIT 1');
    const notificationsEnabled = settings[0]?.email_notifications;

    if (notificationsEnabled) {
      const [admins] = await pool.query('SELECT email FROM Admin');
      const adminEmails = admins.map(admin => admin.email);

      for (const to of adminEmails) {
        await transporter.sendMail({
          from: `"Gracie Shoe Hub" <${process.env.SENDER_EMAIL}>`,
          to,
          subject: "New Customer Query Received",
          html: `
            <h3>New Query Submitted</h3>
            <p><strong>Name:</strong> ${names}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${description}</p>
          `,
        });
      }
    }

    return res.json({ success: true, message: "Successfully delivered" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const getUserMessage = async (req,res) => {
    try {
        const message = await getUserQuery();
        res.json({ success: true, data: message });
      } catch (err) {
        res.json({ success: false, message: 'Failed to userQuery' });
      }
}



export const sendMessageToUser = async (req,res) => {
    const {email,message} = req.body;

    if(!email || !message){
        return res.json({success:false, message:"missing details"})
    }

    try {

       const compiledTemplate = handlebars.compile(MESSAGE_RESPONSE_TEMPLATE);

       const htmlContent = compiledTemplate({
        email,
        message,
        supportLink: "https://yourdomain.com/support" 
      });

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Response to your query',
        html: htmlContent
      };
        
    await transporter.sendMail(mailOptions);

     // Update the query with the admin's response
     await pool.query(
      'UPDATE messages SET response = ?, respondedAt = NOW() WHERE email = ? ORDER BY createdAt DESC LIMIT 1',
      [message, email]
    );

    return res.json({ success: true, message: 'Response sent and saved.' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}


export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if message exists
    const [message] = await pool.query('SELECT * FROM messages WHERE _id = ?', [id]);
    if (!message.length) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Then delete
    await pool.query('DELETE FROM messages WHERE _id = ?', [id]);
    
    res.json({ 
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message' 
    });
  }
};






