import pool from '../config/connectDb.js';
import transporter from '../config/nodemailer.js';
import 'dotenv/config';

export const subscribe = async (req, res) => {
    try {
        const { email, source = 'website' } = req.body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        }

        // Check if email exists
        const [existing] = await pool.query(
            'SELECT * FROM subscribers WHERE email = ?', 
            [email.toLowerCase()]
        );

        if (existing.length > 0) {
            if (existing[0].unsubscribed) {
                // Resubscribe if previously unsubscribed
                await pool.query(
                    'UPDATE subscribers SET unsubscribed = FALSE, unsubscribed_at = NULL WHERE email = ?',
                    [email.toLowerCase()]
                );
                
                // Send welcome email
                await sendWelcomeEmail(email);
                
                return res.json({ success: true, message: 'Subscription renewed successfully' });
            }
            return res.json({ success: false, message: 'This email is already subscribed' });
        }

        // Insert new subscriber
        await pool.query(
            'INSERT INTO subscribers (email, source) VALUES (?, ?)',
            [email.toLowerCase(), source]
        );

        // Send welcome email
        await sendWelcomeEmail(email);

        return res.json({ success: true, message: 'Subscription successful' });

    } catch (error) {
        console.error('Subscription error:', error);
        
        // Handle MySQL duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.json({ success: false, message: 'This email is already subscribed' });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).send('Email address is required');
        }

        // First show a confirmation page
        if (!req.query.confirm) {
            return res.send(`
                <html>
                    <body>
                        <h2>Unsubscribe Confirmation</h2>
                        <p>Are you sure you want to unsubscribe ${email}?</p>
                        <a href="${process.env.VITE_BACKEND_URL}/api/messages/unsubscribe?email=${email}&confirm=true">Yes, unsubscribe me</a>
                    </body>
                </html>
            `);
        }

        // Process actual unsubscription
        const [result] = await pool.query(
            'UPDATE subscribers SET unsubscribed = TRUE, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?',
            [email.toLowerCase()]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Email not found in our subscribers list');
        }

        return res.send(`
            <html>
                <body>
                    <h2>Unsubscription Successful</h2>
                    <p>${email} has been unsubscribed from our newsletter.</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return res.status(500).send('Internal server error');
    }
};


const sendWelcomeEmail = async (email) => {
    try {
        const fromAddress = `"Vicky's Store" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`;
        
        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: 'Welcome to Our Newsletter!',
            text: `Thank you for subscribing!\n\nYou'll now receive our latest shoe collections, exclusive offers, and style inspiration.\n\nHere's 10% off your first order: WELCOME10\n\nHappy shopping!\n\nThe Vicky's Team\n\nUnsubscribe link: ${process.env.BASE_URL}/unsubscribe?email=${email}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Thank you for subscribing!</h2>
                    <p>You'll now receive our latest shoe collections, exclusive offers, and style inspiration.</p>
                    <p>Here's 10% off your first order: <strong>WELCOME10</strong></p>
                    <p>Happy shopping!</p>
                    <p>The Vicky's Team</p>
                    <hr>
                    <p style="font-size: 12px; color: #777;">
                        If you wish to unsubscribe, <a href="${process.env.VITE_BACKEND_URL}/unsubscribe?email=${email}">click here</a>.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        return info;
        
    }  catch (error) {
        console.error('Error sending welcome email:', error);
        throw error; 
    }
};

