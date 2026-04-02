# Backend Email Service Setup Instructions

## Prerequisites
- Node.js (v12 or higher) installed on your machine.

## Gmail Configuration Steps
1. **Enable 2-Step Verification** for your Gmail account.
2. **Create an App Password:**  
   - Go to your Google Account settings and select Security.  
   - Under "Signing in to Google," select App Passwords.  
   - Select the app and device you want to generate the app password for.  
   - Copy the generated app password; you will need it later.

## npm Installation

Run the following command to install the required dependencies:
```bash
npm install
```

## Environment Variables Setup

Create a `.env` file in the root of your project with the following variables:
```plaintext
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
PORT=your_server_port
```
Replace `your_email@gmail.com` with your Gmail address and `your_app_password` with the app password you generated earlier. Set `your_server_port` to the desired port number.

## Running the Server

Use the following command to run the server:
```bash
node index.js
```

Your backend email service should now be running. You can test the email functionality by sending a test email from the server.