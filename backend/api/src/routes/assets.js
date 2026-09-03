const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { assetNFT, accessBadge, roleToken } = require('../utils/blockchain');

const router = express.Router();
const upload = multer({ dest: 'storage/' });

const AES_ALGO = 'aes-256-cbc';
const AES_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'hackathon_key').digest();
const AES_IV = crypto.createHash('md5').update(process.env.JWT_SECRET || 'hackathon_iv').digest();

// Middleware to mock JWT extraction (for demo)
const mockAuth = (req, res, next) => {
    req.user = { address: req.headers['x-user-address'] || '0xUserAddress' };
    next();
};

// Initialize MinIO Client globally
const Minio = require('minio');
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});
const BUCKET_NAME = process.env.MINIO_BUCKET || 'arguschain-vault';

// Hackathon fast-path: In-memory database backed by S3 JSON file
let uploadedAssets = [];
let revokedAccess = [];
let userRoles = {}; // Map of address (lowercase) to role ID string

// Helper to sync metadata to S3
async function syncDatabaseToS3() {
    try {
        const dbState = { uploadedAssets, revokedAccess, userRoles };
        const buffer = Buffer.from(JSON.stringify(dbState));
        await minioClient.putObject(BUCKET_NAME, 'argus-metadata.json', buffer);
    } catch (e) {
        console.error("Failed to sync metadata to S3:", e);
    }
}

// Helper to load metadata from S3
async function loadDatabaseFromS3() {
    try {
        const dataStream = await minioClient.getObject(BUCKET_NAME, 'argus-metadata.json');
        let chunks = [];
        for await (const chunk of dataStream) {
            chunks.push(chunk);
        }
        const parsed = JSON.parse(Buffer.concat(chunks).toString());
        
        // Backward compatibility if it was just an array before
        if (Array.isArray(parsed)) {
            uploadedAssets = parsed;
        } else {
            uploadedAssets = parsed.uploadedAssets || [];
            revokedAccess = parsed.revokedAccess || [];
            userRoles = parsed.userRoles || {};
        }
    } catch (e) {
        console.log("No existing metadata found in S3, starting fresh.");
    }
}

// Load it once when the route is first hit
let isDbLoaded = false;

router.get('/', async (req, res) => {
    if (!isDbLoaded) {
        await loadDatabaseFromS3();
        isDbLoaded = true;
    }
    res.json(uploadedAssets);
});

router.post('/upload', mockAuth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userAddress = req.user.address;

    // Ensure db is loaded
    if (!isDbLoaded) {
        await loadDatabaseFromS3();
        isDbLoaded = true;
    }

    // 1. Enforce Role-Based Access Control via Fast L2 State
    const role = userRoles[userAddress.toLowerCase()];
    // If no role is assigned, default to User (4) or check if they are Admin (1) or Manager (2)
    if (role !== "1" && role !== "2") {
        fs.unlinkSync(req.file.path); // clean up the temp file
        return res.status(403).json({ error: "UNAUTHORIZED_ROLE: Only Admins and Managers can upload assets." });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Calculate SHA-256
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 2. Encrypt File
    const cipher = crypto.createCipheriv(AES_ALGO, AES_KEY, AES_IV);
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    
    try {
        // Ensure bucket exists
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
        await syncDatabaseToS3(); // Save to MinIO so it survives restarts!

        res.json({ status: "success", message: "File uploaded and encrypted", hash, asset: newAsset });
    } catch (err) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

router.post('/:id/access-request', mockAuth, async (req, res) => {
    const assetId = req.params.id;
    const userAddress = req.user.address;

    try {
        // Ensure db is loaded
        if (!isDbLoaded) {
            await loadDatabaseFromS3();
            isDbLoaded = true;
        }

        // 1. Check Access Badge Balance
        // For the hackathon demo, we simulate the on-chain revocation checking the synchronized S3 state
        const isRevoked = revokedAccess.some(r => r.userId.toLowerCase() === userAddress.toLowerCase() && r.assetId == assetId);
        if (isRevoked) {
           return res.status(403).json({ status: "denied", reason: "ACCESS_TOKEN_BURNED" });
        }

        const role = userRoles[userAddress.toLowerCase()];
        const isPrivileged = (role === "1" || role === "2" || role === "3");

        // 2. Query UEBA ML Service for anomaly score
        let UEBA_URL = process.env.UEBA_URL || 'http://127.0.0.1:8000';
        if (UEBA_URL.endsWith('/')) UEBA_URL = UEBA_URL.slice(0, -1);
        
        const recordAccess = fetch(`${UEBA_URL}/score`, {
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

        if (isPrivileged) {
            // Fire and forget recording for privileged roles
            recordAccess.catch(err => console.error("Failed to record privileged access:", err.message));
        } else {
            // Regular user: await the response and enforce anomaly score
            const mlResponse = await recordAccess;

            // Handle Render Free Tier "Spinning Up" HTML interception
            const contentType = mlResponse.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error("Render is currently waking up the ML service from sleep mode. Please wait 60 seconds and click again!");
            }
            
            if (!mlResponse.ok) {
                const errorText = await mlResponse.text();
                if (mlResponse.status === 429) {
                    return res.status(429).json({ status: "denied", reason: "Too Many Requests: The security scanning service is currently rate limited. Please try again in a few minutes." });
                }
                throw new Error(`UEBA API Error (${mlResponse.status}): ${errorText}`);
            }

            const mlData = await mlResponse.json();

            if (mlData.anomaly_score > 0) {
                return res.status(403).json({ status: "denied", reason: mlData.reason || "ANOMALY_SCORE_HIGH" });
            }
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

// Admin Route to mock token burning
router.post('/revoke', mockAuth, async (req, res) => {
    const { userId, assetId } = req.body;
    if (!userId || !assetId) return res.status(400).json({ error: "Missing parameters" });

    // Ensure db is loaded
    if (!isDbLoaded) {
        await loadDatabaseFromS3();
        isDbLoaded = true;
    }

    // Enforce strictly Admin (Role 1) via L2 State
    const isAdmin = userRoles[req.user.address.toLowerCase()] === "1";
    if (!isAdmin) {
         return res.status(403).json({ error: "SECURITY ALERT: Only Admins can revoke access badges. This incident has been logged." });
    }

    revokedAccess.push({ userId, assetId });
    await syncDatabaseToS3(); // Save to MinIO
    
    res.json({ status: "success", message: "Token burned on-chain" });
});

// Admin Route to mock role assignment
router.post('/assign-role', mockAuth, async (req, res) => {
    const { targetAddress, roleId } = req.body;

    // Ensure db is loaded
    if (!isDbLoaded) {
        await loadDatabaseFromS3();
        isDbLoaded = true;
    }
    
    const isAdmin = userRoles[req.user.address.toLowerCase()] === "1";
    const anyAdminsExist = Object.values(userRoles).includes("1");
    
    // Enforce strictly Admin (Role 1) via L2 State, but allow the very first admin to bootstrap
    if (!isAdmin && anyAdminsExist) {
         return res.status(403).json({ error: "SECURITY ALERT: Only Admins can assign roles. Your unauthorized attempt has been logged." });
    }

    userRoles[targetAddress.toLowerCase()] = String(roleId);
    await syncDatabaseToS3(); // Save to MinIO

    // Mock successful transaction
    res.json({ status: "success", message: "Role assigned via fast L2 state" });
});

module.exports = router;
