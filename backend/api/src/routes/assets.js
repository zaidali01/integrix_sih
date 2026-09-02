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

// Hackathon fast-path: In-memory array so uploads survive page refreshes
let uploadedAssets = [];

router.get('/', (req, res) => {
    res.json(uploadedAssets);
});

router.post('/upload', mockAuth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Calculate SHA-256
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 2. Encrypt File
    const cipher = crypto.createCipheriv(AES_ALGO, AES_KEY, AES_IV);
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    
    // Initialize MinIO Client (Configure these via .env for production)
    const Minio = require('minio');
    const minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
    const BUCKET_NAME = process.env.MINIO_BUCKET || 'arguschain-vault';

    try {
        // Ensure bucket exists (in production, do this at startup)
        const exists = await minioClient.bucketExists(BUCKET_NAME).catch(()=>false);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1').catch(console.error);
        }
        // Upload encrypted buffer to MinIO
        await minioClient.putObject(BUCKET_NAME, `${hash}.enc`, encrypted);
        fs.unlinkSync(filePath); // delete temp local file
    } catch (storageErr) {
        console.error("Storage Error:", storageErr);
        return res.status(500).json({ error: "Failed to store encrypted asset in MinIO" });
    }

    // 3. Mint Asset NFT on-chain
    try {
        // Note: For hackathon, assume transaction succeeds
        // const tx = await assetNFT.mintAsset(req.user.address, hash);
        // await tx.wait();
        
        const newAsset = { 
            id: uploadedAssets.length + 1, 
            name: req.file.originalname, 
            hash: "0x" + hash.slice(0, 8) + "..." + hash.slice(-4),
            fullHash: hash,
            date: new Date().toISOString().split('T')[0] 
        };
        uploadedAssets.unshift(newAsset);

        res.json({ status: "success", message: "File uploaded and encrypted", hash, asset: newAsset });
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
        let UEBA_URL = process.env.UEBA_URL || 'http://127.0.0.1:8000';
        if (UEBA_URL.endsWith('/')) UEBA_URL = UEBA_URL.slice(0, -1);
        
        const mlResponse = await fetch(`${UEBA_URL}/score`, {
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

        // Handle Render Free Tier "Spinning Up" HTML interception
        const contentType = mlResponse.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error("Render is currently waking up the ML service from sleep mode. Please wait 60 seconds and click again!");
        }

        const mlData = await mlResponse.json();

        if (mlData.anomaly_score > 0) {
            return res.status(403).json({ status: "denied", reason: mlData.reason || "ANOMALY_SCORE_HIGH" });
        }

        // 3. Find asset, Decrypt and serve
        const targetAsset = uploadedAssets.find(a => a.id == assetId);
        if (!targetAsset || !targetAsset.fullHash) {
            return res.status(404).json({ status: "denied", reason: "Asset not found in memory" });
        }

        // Initialize MinIO Client
        const Minio = require('minio');
        const minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
        });
        const BUCKET_NAME = process.env.MINIO_BUCKET || 'arguschain-vault';

        const dataStream = await minioClient.getObject(BUCKET_NAME, `${targetAsset.fullHash}.enc`);
        let encryptedChunks = [];
        for await (const chunk of dataStream) {
            encryptedChunks.push(chunk);
        }
        const encryptedBuffer = Buffer.concat(encryptedChunks);

        const decipher = crypto.createDecipheriv(AES_ALGO, AES_KEY, AES_IV);
        const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

        res.json({ 
            status: "granted", 
            message: "Access granted! Downloading file...", 
            fileBase64: decryptedBuffer.toString('base64') 
        });

    } catch (error) {
        console.error("UEBA Error:", error);
        res.status(500).json({ status: "denied", reason: "Internal Server Error: " + error.message });
    }
});

module.exports = router;
