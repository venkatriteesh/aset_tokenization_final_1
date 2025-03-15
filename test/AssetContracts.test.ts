import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Asset Tokenization Contracts", function () {
  let AssetNFT;
  let AssetToken;
  let assetNFT;
  let assetToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AssetNFT contract
    AssetNFT = await ethers.getContractFactory("AssetNFT");
    assetNFT = await AssetNFT.deploy();
    await assetNFT.deployed();

    // Deploy AssetToken contract
    AssetToken = await ethers.getContractFactory("AssetToken");
    assetToken = await AssetToken.deploy(assetNFT.address);
    await assetToken.deployed();
  });

  describe("AssetNFT", function () {
    it("Should initialize with correct name and symbol", async function () {
      expect(await assetNFT.name()).to.equal("Asset NFT");
      expect(await assetNFT.symbol()).to.equal("ANFT");
    });

    it("Should mint a new asset", async function () {
      const tokenId = 1;
      const assetType = "property";
      const governmentId = "PROP123";
      const tokenURI = "ipfs://QmExample";

      await assetNFT.mintAsset(
        addr1.address,
        tokenId,
        assetType,
        governmentId,
        tokenURI
      );

      expect(await assetNFT.ownerOf(tokenId)).to.equal(addr1.address);
      
      const details = await assetNFT.getAssetDetails(tokenId);
      expect(details[0]).to.equal(assetType);
      expect(details[1]).to.equal(governmentId);
      expect(details[2]).to.equal(false); // Not verified initially
    });

    it("Should verify an asset", async function () {
      const tokenId = 1;
      await assetNFT.mintAsset(
        addr1.address,
        tokenId,
        "property",
        "PROP123",
        "ipfs://QmExample"
      );

      await assetNFT.verifyAsset(tokenId);
      const details = await assetNFT.getAssetDetails(tokenId);
      expect(details[2]).to.equal(true);
    });

    it("Should fail to verify non-existent asset", async function () {
      await expect(assetNFT.verifyAsset(999))
        .to.be.revertedWith("Token does not exist");
    });
  });

  describe("AssetToken", function () {
    const tokenId = 1;
    const mintAmount = ethers.utils.parseEther("100");

    beforeEach(async function () {
      // Mint and verify an NFT first
      await assetNFT.mintAsset(
        addr1.address,
        tokenId,
        "property",
        "PROP123",
        "ipfs://QmExample"
      );
      await assetNFT.verifyAsset(tokenId);
    });

    it("Should initialize with correct name and symbol", async function () {
      expect(await assetToken.name()).to.equal("Asset Token");
      expect(await assetToken.symbol()).to.equal("AST");
      expect(await assetToken.decimals()).to.equal(18);
    });

    it("Should mint tokens for verified asset", async function () {
      await assetToken.mintTokens(addr1.address, tokenId, mintAmount);
      expect(await assetToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should fail to mint tokens for unverified asset", async function () {
      const newTokenId = 2;
      await assetNFT.mintAsset(
        addr1.address,
        newTokenId,
        "property",
        "PROP456",
        "ipfs://QmExample2"
      );

      await expect(
        assetToken.mintTokens(addr1.address, newTokenId, mintAmount)
      ).to.be.revertedWith("Asset must be verified");
    });

    it("Should allow token transfers", async function () {
      await assetToken.mintTokens(addr1.address, tokenId, mintAmount);
      await assetToken.connect(addr1).transfer(addr2.address, mintAmount.div(2));

      expect(await assetToken.balanceOf(addr1.address)).to.equal(
        mintAmount.div(2)
      );
      expect(await assetToken.balanceOf(addr2.address)).to.equal(
        mintAmount.div(2)
      );
    });

    it("Should burn tokens", async function () {
      await assetToken.mintTokens(addr1.address, tokenId, mintAmount);
      const burnAmount = mintAmount.div(2);

      await assetToken.connect(addr1).burnTokens(burnAmount);
      expect(await assetToken.balanceOf(addr1.address)).to.equal(burnAmount);
      expect(await assetToken.totalSupply()).to.equal(burnAmount);
    });
  });
}); 