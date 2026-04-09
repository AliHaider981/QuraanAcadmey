const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://alihaider981.github.io',
        'https://alihaider981.github.io/QuraanAcadmey',
        'https://quraanacadmey-production-3b5f.up.railway.app'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.send('Server is running on port ' + PORT);
});

// Gmail transporter using App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
    const { userEmail, subject, message } = req.body;

    console.log('Received email request from:', userEmail);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Missing Gmail credentials in .env');
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    try {
        // Notify admin (you) with full details
        await transporter.sendMail({
            from: `"NoorPath Academy" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `NoorPath: ${subject}`,
            text: message,
            html: `<pre style="font-family:sans-serif;font-size:15px;">${message.replace(/\n/g, '<br>')}</pre>`
        });

        // Confirmation to the user who submitted the form
        await transporter.sendMail({
            from: `"NoorPath Academy" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'We received your message – NoorPath Quran Academy',
            html: `
                <div style="font-family:sans-serif;max-width:560px;margin:auto;">
                    <h2 style="color:#1a3d2b;">Assalamu Alaikum 🌙</h2>
                    <p>Thank you for reaching out to <strong>NoorPath Quran Academy</strong>.</p>
                    <p>We have received your message and will get back to you within <strong>24 hours</strong>.</p>
                    <p>Your first trial class is free – we look forward to welcoming you!</p>
                    <br>
                    <p style="color:#6b7280;font-size:13px;">– The NoorPath Team</p>
                </div>
            `
        });

        console.log('Emails sent successfully');
        res.status(200).json({ success: true, message: 'Emails sent successfully.' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email.', details: error.message });
    }
});

// Serve static files
app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
