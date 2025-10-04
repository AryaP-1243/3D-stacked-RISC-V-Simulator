
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// Use a more robust CORS configuration to handle all request types.
// This is the key fix for the "Network Connection Failed" error.
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

// In-memory store for OTPs for demonstration purposes.
// In a real production app, you would use a database like Redis.
const otpStore = new Map();

/**
 * @route   GET /
 * @desc    Health check endpoint to see if the server is running.
 * @access  Public
 */
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'OTP server is running.' });
});

/**
 * @route   POST /send-otp
 * @desc    Generates a 6-digit OTP, stores it with a 5-minute expiry,
 *          and logs it to the console instead of emailing it.
 * @access  Public
 */
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  otpStore.set(email, { otp, expires });

  // *** CRITICAL FOR DEMO ***
  // In a real app, you would use a service like SendGrid or Nodemailer here.
  // For this secure, client-side-only project, we log to the console.
  console.log(`\n\n--- OTP Service ---`);
  console.log(`OTP generated for ${email}: ${otp}`);
  console.log(`It will expire in 5 minutes.`);
  console.log(`--- End Service ---\n\n`);

  res.json({
    success: true,
    message: 'OTP has been generated. Please check the server console.'
  });
});

/**
 * @route   POST /verify-otp
 * @desc    Verifies the user-provided OTP against the stored one.
 * @access  Public
 */
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
  }

  if (Date.now() > storedData.expires) {
    otpStore.delete(email); // Clean up expired OTP
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (storedData.otp === otp) {
    otpStore.delete(email); // OTP is used, so delete it
    res.json({ success: true, message: 'Login successful.' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP.' });
  }
});

app.listen(port, () => {
  console.log(`OTP backend server listening on http://localhost:${port}`);
  console.log("Waiting for OTP requests from the application...");
});