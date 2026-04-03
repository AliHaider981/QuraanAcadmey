const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware - set headers manually for maximum compatibility
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://alihaider981.github.io',
        'https://alihaider981.github.io/QuraanAcadmey',
        'https://quraanacadmey-production.up.railway.app'
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Health check route
app.get('/', (req, res) => {
    res.send('Server is running on port ' + PORT);
});

// Configure nodemailer transporter
let transporter;
try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
        console.error('EMAIL_USER:', process.env.EMAIL_USER);
        console.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'NOT SET');
        transporter = null; // Set to null if not configured
    } else {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            // Add connection timeout
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000
        });
        console.log('Nodemailer transporter created successfully');
    }
} catch (error) {
    console.error('Error creating nodemailer transporter:', error);
    transporter = null;
}

// Send email endpoint
app.post('/send-email', async (req, res) => {
    const { userEmail, subject, message } = req.body;
    
    console.log('Received email request:', { userEmail, subject });

    if (!transporter) {
        console.error('Email transporter not configured');
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    try {
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
        await transporter.sendMail(userMailOptions);
        console.log('Email sent to user successfully');

        // Send email to admin
        await transporter.sendMail(adminMailOptions);
        console.log('Email sent to admin successfully');

        res.status(200).json({ success: true, message: 'Emails sent successfully.' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Error sending emails.', details: error.message });
    }
});

// Serve static files (index.html and assets) — registered after API routes
// so POST /send-email is never shadowed by the static handler
app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});