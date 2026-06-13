import express from 'express';
import { isBrevoConfigured, sendTestEmail } from '../services/emailService.js';

const router = express.Router();

// Email status check endpoint
router.get('/status', (req, res) => {
  const config = isBrevoConfigured();
  res.status(200).json({
    provider: "Brevo",
    apiKeyConfigured: config.apiKeyConfigured,
    senderConfigured: config.senderConfigured
  });
});

// Test email endpoint
router.get('/test', async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email parameter is required'
    });
  }

  const result = await sendTestEmail(email);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
