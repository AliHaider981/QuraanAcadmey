const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://alihaider981.github.io', 'https://alihaider981.github.io/QuraanAcadmey'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Handle preflight
app.use(express.json());

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Admin email
        pass: process.env.GMAIL_PASS    // Admin email password
    }
});

// Send email endpoint
app.post('/send-email', (req, res) => {
    const { userEmail, subject, message } = req.body;

    // Email options for user confirmation
    const userMailOptions = {
        from: process.env.GMAIL_USER, // Admin email
        to: userEmail,
        subject: subject,
        text: message,
    };

    // Email options for admin notification
    const adminMailOptions = {
        from: process.env.GMAIL_USER, // Admin email
        to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,  // Admin email for notifications
        subject: `New email from: ${userEmail}`,
        text: `User Email: ${userEmail}\nMessage: ${message}`,
    };

    // Send email to user
    transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending email to user.');
        }
        // Send email to admin
        transporter.sendMail(adminMailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Error sending email to admin.');
            }
            res.status(200).send('Emails sent successfully.');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});