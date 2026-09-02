# ArgusChain 🛡️

ArgusChain is a next-generation decentralized cybersecurity architecture built for the Smart India Hackathon (SIH). It replaces traditional, easily compromised username/password systems with a robust 3-layer security protocol combining **Blockchain**, **Cryptography**, and **Machine Learning (UEBA)**.

---

## 🏗️ System Architecture (The 3 Layers)

1. **Identity Layer (Soulbound Tokens):** Users establish their identity by connecting a Web3 wallet (like MetaMask) and signing a cryptographic challenge. Upon verification, they are minted a non-transferable (Soulbound) Identity NFT. No passwords to steal.
2. **Access Control Layer (ERC-1155 & AES-256):** Network assets (files, documents) are AES-256 encrypted and stored securely off-chain. Only the immutable SHA-256 hash is minted on-chain. Access to decrypt and download these files is strictly gated by Role Tokens and Access Badges (ERC-1155) issued by network Administrators.
3. **UEBA ML Layer (SOC Copilot):** A Python-based User and Entity Behavior Analytics (UEBA) service monitors all network requests in real-time. Using an Isolation Forest model and hardcoded Honeypots, it detects anomalous behavior (e.g., a compromised wallet attempting to scrape 50 files in 10 seconds). If flagged, access is denied in real-time with an "Explainable Denial", and human Admins can permanently revoke the attacker's badges.

---

## 🚀 Getting Started

To run the entire ArgusChain suite locally for development or presentation, you need to start 4 separate services:

### 1. Smart Contracts (Local Blockchain)
We use Hardhat to simulate an Ethereum network.
```bash
cd contracts
npm install
# Start the local blockchain
npx hardhat node
```
*In a new terminal window, deploy the contracts to your local network:*
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Node.js API (The Orchestrator)
The Node API bridges the React frontend, the Blockchain, and the ML Service.
```bash
cd backend/api
npm install
# Start the Express server (runs on http://localhost:3000)
node src/server.js
```

### 3. Python UEBA Service (Machine Learning)
The FastAPI service that provides real-time anomaly scoring.
```bash
cd backend/ueba-service
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate
# Install requirements
pip install fastapi uvicorn pydantic
# Start the ML server (runs on http://localhost:8000)
uvicorn main:app --reload
```

### 4. React Frontend (The User Interface)
The sleek, glassmorphic UI built with Vite and Tailwind.
```bash
cd frontend
npm install
# Start the React development server
npm run dev
```

---

## 📖 User Flow Walkthrough (How to use it)

1. **Establish Identity:** Go to the `/onboarding` page. Click **Connect & Sign Challenge**. This simulates the wallet connection and signature verification, minting your Soulbound Identity NFT.
2. **Assign Roles:** Navigate to the `/admin` (Admin Console). Enter an Ethereum address and assign them a network Role (e.g., Manager or User).
3. **Upload an Asset:** Go to the `/vault` (Asset Vault). Upload a file. The Node backend will AES-256 encrypt it locally into `/backend/storage` and mint the SHA-256 hash on-chain.
4. **Monitor Threats:** Open the `/soc` (SOC Copilot). Watch the real-time Recharts graph plot network activity. This is where Admins can see alerts if the UEBA system flags anomalous volume spikes or Honeypot access attempts!
