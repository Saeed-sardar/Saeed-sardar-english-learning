const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Temporary In-Memory Database (Vercel Serverless environment)
// Production me Vercel KV / MongoDB / Supabase connect kar sakte hain
const usersDB = [];
const otpStore = {};

// 1. Strict Rate Limiter: Max 30 Requests per 15 Minutes per IP
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: { status: "error", message: "Too many requests. Your IP has been temporarily blocked for 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', strictLimiter);

// 2. Step 1: Registration & Email OTP Request
app.post('/api/auth/step1-email', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        emailOtp,
        step: 1
    };

    console.log(`[MOCK EMAIL SENT] To: ${email} | OTP: ${emailOtp}`);
    return res.json({ status: "success", message: "Email OTP sent successfully! Check your inbox.", mockOtp: emailOtp });
});

// 3. Step 2: Verify Email OTP & Send Phone SMS OTP
app.post('/api/auth/step2-verify-email', (req, res) => {
    const { email, otp, phoneNumber } = req.body;
    const record = otpStore[email];

    if (!record || record.emailOtp !== otp) {
        return res.status(400).json({ status: "error", message: "Invalid Email OTP!" });
    }

    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    record.phoneNumber = phoneNumber;
    record.phoneOtp = phoneOtp;
    record.step = 2;

    console.log(`[MOCK SMS SENT] To: ${phoneNumber} | OTP: ${phoneOtp}`);
    return res.json({ status: "success", message: "Phone SMS OTP sent successfully!", mockOtp: phoneOtp });
});

// 4. Step 3: Verify Phone OTP & Complete Registration
app.post('/api/auth/step3-verify-phone', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record || record.phoneOtp !== otp) {
        return res.status(400).json({ status: "error", message: "Invalid Phone OTP!" });
    }

    // Database me user save karna
    usersDB.push({
        id: usersDB.length + 1,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        phoneNumber: record.phoneNumber,
        password: record.password, // Bcrypt Hashed Password
        verified: true
    });

    delete otpStore[email];
    return res.json({ status: "success", message: "Registration complete! You can now log in." });
});

// 5. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = usersDB.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ status: "error", message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ status: "error", message: "Invalid password!" });
    }

    return res.json({ status: "success", message: "Login successful!", user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
});

module.exports = app;
      
