const express = require('express');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_hackathon';

// In-memory store for nonces
const nonces = {};

router.post('/challenge', (req, res) => {
    const { did } = req.body;
    if (!did) return res.status(400).json({ error: 'DID is required' });

    // Generate a random 32-byte nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    nonces[did] = nonce;

    res.json({ nonce });
});

router.post('/verify', (req, res) => {
    const { did, signature } = req.body;
    const nonce = nonces[did];

    if (!nonce) return res.status(400).json({ error: 'No nonce found for DID' });

    try {
        // Recover the address that signed the nonce message
        const recoveredAddress = ethers.verifyMessage(nonce, signature);
        
        // Assuming the DID format is did:ethr:<address>
        const expectedAddress = did.split(':').pop();

        if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
            // Signature is valid. Issue JWT.
            const token = jwt.sign({ did, address: recoveredAddress }, JWT_SECRET, { expiresIn: '1h' });
            delete nonces[did]; // nonce is single-use
            return res.json({ token, status: 'success' });
        } else {
            return res.status(401).json({ error: 'Signature verification failed' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Invalid signature format' });
    }
});

module.exports = router;
