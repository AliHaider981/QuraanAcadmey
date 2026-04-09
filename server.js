const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check — Railway pings this to confirm server is alive
app.get('/', (req, res) => {
    res.status(200).send('NoorPath server is running.');
});

// Send Email via Resend (HTTPS — no SMTP, works on Railway)
app.post('/send-email', async (req, res) => {
    const { userEmail, subject, message } = req.body;

    console.log('Email request from:', userEmail);

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not set');
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    const FROM = 'NoorPath Academy <onboarding@resend.dev>';
    const ADMIN = process.env.ADMIN_EMAIL;

    try {
        // 1. Notify admin
        const adminResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM,
                to: ADMIN,
                subject: `NoorPath Enquiry: ${subject}`,
                html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.8;">
                    ${message.replace(/</g, '&lt;').replace(/\n/g, '<br>')}
                </div>`
            })
        });

        if (!adminResp.ok) {
            const err = await adminResp.json();
            console.error('Resend error (admin):', JSON.stringify(err));
            return res.status(500).json({ error: 'Failed to send email.', details: err });
        }

        // 2. Confirm to user
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM,
                to: userEmail,
                subject: 'We received your message – NoorPath Quran Academy',
                html: `
                    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
                        <h2 style="color:#1a3d2b;">Assalamu Alaikum 🌙</h2>
                        <p>Thank you for contacting <strong>NoorPath Quran Academy</strong>.</p>
                        <p>We received your message and will reply within <strong>24 hours</strong>.</p>
                        <p>Your first trial class is <strong>free</strong> — we look forward to meeting you!</p>
                        <br>
                        <p style="color:#999;font-size:13px;">— The NoorPath Team</p>
                    </div>
                `
            })
        });

        console.log('Emails sent successfully');
        res.status(200).json({ success: true });

    } catch (err) {
        console.error('Unexpected error:', err.message);
        res.status(500).json({ error: 'Unexpected error.', details: err.message });
    }
});

app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});