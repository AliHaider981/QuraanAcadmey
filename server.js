const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://alihaider981.github.io', 'https://alihaider981.github.io/QuraanAcadmey', 'https://quraanacadmey-production.up.railway.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Handle preflight
app.use(express.json());

// Configure nodemailer transporter
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
    console.error('EMAIL_USER:', process.env.EMAIL_USER);
    console.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'NOT SET');
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'noemail@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'nopass'
    }
});

// Send email endpoint
app.post('/send-email', (req, res) => {
    const { userEmail, subject, message } = req.body;
    
    console.log('Received email request:', { userEmail, subject });

    // Email options for user confirmation
    const userMailOptions = {
        from: process.env.EMAIL_USER, // Admin email
        to: userEmail,
        subject: subject,
        text: message,
    };

    // Email options for admin notification
    const adminMailOptions = {
        from: process.env.EMAIL_USER, // Admin email
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,  // Admin email for notifications
        subject: `New email from: ${userEmail}`,
        text: `User Email: ${userEmail}\nMessage: ${message}`,
    };

    // Send email to user
    transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to user:', error);
            return res.status(500).json({ error: 'Error sending email to user.', details: error.message });
        }
        // Send email to admin
        transporter.sendMail(adminMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to admin:', error);
                return res.status(500).json({ error: 'Error sending email to admin.', details: error.message });
            }
            console.log('Emails sent successfully');
            res.status(200).json({ success: true, message: 'Emails sent successfully.' });
        });
    });
});

// Serve static files (index.html and assets) — registered after API routes
// so POST /send-email is never shadowed by the static handler
app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});