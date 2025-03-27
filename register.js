import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const router = express.Router();
const otpStore = new Map();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/', async (req, res) => {
  const { step, phone, otp, name, email, password } = req.body;

  try {
    if (step === 'send_otp') {
      const generatedOTP = generateOTP();
      otpStore.set(phone, generatedOTP);

      // Custom SMS template
      const message = `Hello! Your verification code for Online Planet is ${generatedOTP}.`;

      await client.messages.create({
        body: message,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, // Use Messaging Service SID instead of "from"
        to: phone
      });
      

      return res.status(200).json({ message: 'OTP sent via SMS with custom template' });
    }

    if (step === 'verify_otp') {
      const storedOTP = otpStore.get(phone);
      if (storedOTP && storedOTP === otp) {
        otpStore.set(phone, 'verified');
        return res.status(200).json({ message: 'OTP verified' });
      } else {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    }

    if (step === 'register') {
      if (otpStore.get(phone) !== 'verified') {
        return res.status(401).json({ error: 'OTP not verified' });
      }

      // Registration logic here
      console.log('Registering user:', { name, email, phone, password });

      otpStore.delete(phone);
      return res.status(200).json({ message: 'Registration successful' });
    }

    res.status(400).json({ error: 'Invalid step' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as register };
