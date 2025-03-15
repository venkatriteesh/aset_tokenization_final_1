import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy AssetNFT contract
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.deployed();
  console.log("AssetNFT deployed to:", assetNFT.address);

  // Deploy AssetToken contract with AssetNFT address
  const AssetToken = await ethers.getContractFactory("AssetToken");
  const assetToken = await AssetToken.deploy(assetNFT.address);
  await assetToken.deployed();
  console.log("AssetToken deployed to:", assetToken.address);

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 