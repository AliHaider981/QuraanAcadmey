const express = require('express');
const sgMail = require('@sendgrid/mail');
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

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid configured successfully');
} else {
    console.error('Missing SENDGRID_API_KEY environment variable');
}

// Send email endpoint
app.post('/send-email', async (req, res) => {
    const { userEmail, subject, message } = req.body;
    
    console.log('Received email request:', { userEmail, subject });

    if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    try {
        // Email options for user confirmation
        const userMsg = {
            to: userEmail,
            from: process.env.ADMIN_EMAIL || 'noreply@quraanacademy.com', // Use verified sender
            subject: subject,
            text: message,
        };

        // Email options for admin notification
        const adminMsg = {
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@quraanacademy.com',
            from: process.env.ADMIN_EMAIL || 'noreply@quraanacademy.com',
            subject: `New email from: ${userEmail}`,
            text: `User Email: ${userEmail}\nMessage: ${message}`,
        };

        // Send email to user
        await sgMail.send(userMsg);
        console.log('Email sent to user successfully');

        // Send email to admin
        await sgMail.send(adminMsg);
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