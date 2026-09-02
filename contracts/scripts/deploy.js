import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy IdentityNFT
  const IdentityNFT = await hre.ethers.getContractFactory("IdentityNFT");
  const identityNFT = await IdentityNFT.deploy(deployer.address);
  await identityNFT.waitForDeployment();
  console.log("IdentityNFT deployed to:", await identityNFT.getAddress());

  // Deploy RoleToken
  const RoleToken = await hre.ethers.getContractFactory("RoleToken");
  const roleToken = await RoleToken.deploy(deployer.address);
  await roleToken.waitForDeployment();
  console.log("RoleToken deployed to:", await roleToken.getAddress());

  // Deploy AssetNFT
  const AssetNFT = await hre.ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy(deployer.address);
  await assetNFT.waitForDeployment();
  console.log("AssetNFT deployed to:", await assetNFT.getAddress());

  // Deploy AccessBadge
  const AccessBadge = await hre.ethers.getContractFactory("AccessBadge");
  const accessBadge = await AccessBadge.deploy(deployer.address);
  await accessBadge.waitForDeployment();
  console.log("AccessBadge deployed to:", await accessBadge.getAddress());
  
  // NOTE: In production, the deployer would grant MINTER_ROLE and ISSUER_ROLE to the backend wallet here.
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
