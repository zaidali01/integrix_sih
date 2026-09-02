const { ethers } = require('ethers');

// In a real app, these come from .env
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default Hardhat Account #0

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Mock addresses (to be replaced with actual deployed addresses)
const IDENTITY_NFT_ADDRESS = process.env.IDENTITY_NFT_ADDRESS || "0x0000000000000000000000000000000000000001";
const ROLE_TOKEN_ADDRESS = process.env.ROLE_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000002";
const ASSET_NFT_ADDRESS = process.env.ASSET_NFT_ADDRESS || "0x0000000000000000000000000000000000000003";
const ACCESS_BADGE_ADDRESS = process.env.ACCESS_BADGE_ADDRESS || "0x0000000000000000000000000000000000000004";

// Simple ABIs for what the backend needs
const RoleTokenABI = [
    "function mintRole(address account, uint256 id) public",
    "function balanceOf(address account, uint256 id) public view returns (uint256)"
];
const AssetNFTABI = [
    "function mintAsset(address to, string memory assetHash) public returns (uint256)",
    "function getAssetHash(uint256 tokenId) public view returns (string memory)"
];
const AccessBadgeABI = [
    "function issueBadge(address to, uint256 assetId) public",
    "function revokeBadge(address from, uint256 assetId) public",
    "function balanceOf(address account, uint256 id) public view returns (uint256)"
];

const roleToken = new ethers.Contract(ROLE_TOKEN_ADDRESS, RoleTokenABI, wallet);
const assetNFT = new ethers.Contract(ASSET_NFT_ADDRESS, AssetNFTABI, wallet);
const accessBadge = new ethers.Contract(ACCESS_BADGE_ADDRESS, AccessBadgeABI, wallet);

module.exports = {
    wallet,
    roleToken,
    assetNFT,
    accessBadge
};
