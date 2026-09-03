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
  
  // Grant MINTER_ROLE and ISSUER_ROLE to the deployer so they can test it out of the box
  const minterRole = await assetNFT.MINTER_ROLE();
  await assetNFT.grantRole(minterRole, deployer.address);
  console.log("Granted MINTER_ROLE on AssetNFT to:", deployer.address);

  const issuerRoleIdentity = await identityNFT.ISSUER_ROLE();
  await identityNFT.grantRole(issuerRoleIdentity, deployer.address);
  console.log("Granted ISSUER_ROLE on IdentityNFT to:", deployer.address);

  const issuerRoleBadge = await accessBadge.ISSUER_ROLE();
  await accessBadge.grantRole(issuerRoleBadge, deployer.address);
  console.log("Granted ISSUER_ROLE on AccessBadge to:", deployer.address);
  
  const issuerRoleRole = await roleToken.ISSUER_ROLE();
  await roleToken.grantRole(issuerRoleRole, deployer.address);
  console.log("Granted ISSUER_ROLE on RoleToken to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
