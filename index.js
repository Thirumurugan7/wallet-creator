const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/generate-wallet', async (req, res) => {
  try {
    const { suffix } = req.body;
    
    if (!suffix) {
      return res.status(400).json({ error: 'Suffix is required' });
    }
    
    // Generate wallet with matching suffix - always case sensitive
    const wallet = await generateWalletWithSuffix(suffix, true);
    
    return res.json({
      address: wallet.address,
      privateKey: wallet.privateKey,
      attempts: wallet.attempts
    });
  } catch (error) {
    console.error('Error generating wallet:', error);
    return res.status(500).json({ error: 'Failed to generate wallet' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Generate a wallet with an address ending with the specified suffix
 * @param {string} suffix - The desired suffix for the wallet address
 * @param {boolean} caseSensitive - Whether the suffix matching should be case sensitive
 * @returns {Object} - The generated wallet with address, privateKey and attempts
 */
async function generateWalletWithSuffix(suffix, caseSensitive = true) {
  let attempts = 0;
  const maxAttempts = 1000000; // Safety limit
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    
    // Check if the address ends with the desired suffix - always case sensitive
    const match = address.endsWith(suffix);
    
    if (match) {
      return {
        address,
        privateKey: wallet.privateKey,
        attempts
      };
    }
    
    // Log progress every 10,000 attempts
    if (attempts % 10000 === 0) {
      console.log(`Generated ${attempts} wallets so far...`);
    }
  }
  
  throw new Error(`Failed to find matching wallet after ${maxAttempts} attempts`);
} 