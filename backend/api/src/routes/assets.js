const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { assetNFT, accessBadge } = require('../utils/blockchain');

const router = express.Router();
const upload = multer({ dest: 'storage/' });

const AES_ALGO = 'aes-256-cbc';
const AES_KEY = crypto.randomBytes(32); // In production, this should be a stable Vault key
const AES_IV = crypto.randomBytes(16);

// Middleware to mock JWT extraction (for demo)
const mockAuth = (req, res, next) => {
    req.user = { address: req.headers['x-user-address'] || '0xUserAddress' };
    next();
};

router.post('/upload', mockAuth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Calculate SHA-256
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 2. Encrypt File
    const cipher = crypto.createCipheriv(AES_ALGO, AES_KEY, AES_IV);
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    
    const encryptedPath = path.join(__dirname, '../../storage', `${hash}.enc`);
    fs.writeFileSync(encryptedPath, encrypted);
    fs.unlinkSync(filePath); // delete temp file

    // 3. Mint Asset NFT on-chain
    try {
        // Note: For hackathon, assume transaction succeeds
        // const tx = await assetNFT.mintAsset(req.user.address, hash);
        // await tx.wait();
        res.json({ status: "success", message: "File uploaded and encrypted", hash });
    } catch (err) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

router.post('/:id/access-request', mockAuth, async (req, res) => {
    const assetId = req.params.id;
    const userAddress = req.user.address;

    try {
        // 1. Check Access Badge Balance
        // const balance = await accessBadge.balanceOf(userAddress, assetId);
        // if (balance.toString() === "0") {
        //    return res.status(403).json({ status: "denied", reason: "NO_ASSET_BADGE" });
        // }

        // 2. Query UEBA ML Service for anomaly score
        const mlResponse = await fetch('http://127.0.0.1:8000/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userAddress,
                assetId: assetId,
                action: 'READ',
                timestamp: Date.now(),
                ipAddress: req.ip,
                result: 'ACCESS_REQUEST'
            })
        });
        const mlData = await mlResponse.json();

        if (mlData.anomaly_score > 0) {
            return res.status(403).json({ status: "denied", reason: mlData.reason || "ANOMALY_SCORE_HIGH" });
        }

        // 3. Decrypt and serve
        // Logic to decrypt and serve file here...
        res.json({ status: "granted", message: "Access granted! File content would be served here." });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
