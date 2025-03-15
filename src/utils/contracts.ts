import { ethers } from 'ethers';
import type { BrowserProvider, JsonRpcSigner } from 'ethers';

// Import contract ABIs (these will be generated after compilation)
import AssetNFTABI from '../artifacts/contracts/AssetNFT.vy/AssetNFT.json';
import AssetTokenABI from '../artifacts/contracts/AssetToken.vy/AssetToken.json';

// Contract addresses (to be updated after deployment)
const ASSET_NFT_ADDRESS = process.env.VITE_ASSET_NFT_ADDRESS;
const ASSET_TOKEN_ADDRESS = process.env.VITE_ASSET_TOKEN_ADDRESS;

export class ContractManager {
    private provider: BrowserProvider;
    private signer: JsonRpcSigner | null;
    private assetNFTContract: ethers.Contract | null = null;
    private assetTokenContract: ethers.Contract | null = null;

    constructor(provider: BrowserProvider, signer: JsonRpcSigner | null) {
        this.provider = provider;
        this.signer = signer;
        this.initializeContracts();
    }

    private async initializeContracts() {
        if (!this.signer) return;

        this.assetNFTContract = new ethers.Contract(
            ASSET_NFT_ADDRESS!,
            AssetNFTABI.abi,
            this.signer
        );

        this.assetTokenContract = new ethers.Contract(
            ASSET_TOKEN_ADDRESS!,
            AssetTokenABI.abi,
            this.signer
        );
    }

    async mintAsset(
        to: string,
        tokenId: number,
        assetType: string,
        governmentId: string,
        tokenURI: string
    ): Promise<ethers.TransactionResponse> {
        if (!this.assetNFTContract) throw new Error('Contract not initialized');

        return await this.assetNFTContract.mintAsset(
            to,
            tokenId,
            assetType,
            governmentId,
            tokenURI
        );
    }

    async verifyAsset(tokenId: number): Promise<ethers.TransactionResponse> {
        if (!this.assetNFTContract) throw new Error('Contract not initialized');

        return await this.assetNFTContract.verifyAsset(tokenId);
    }

    async mintTokens(
        to: string,
        tokenId: number,
        amount: ethers.BigNumber
    ): Promise<ethers.TransactionResponse> {
        if (!this.assetTokenContract) throw new Error('Contract not initialized');

        return await this.assetTokenContract.mintTokens(to, tokenId, amount);
    }

    async getAssetDetails(tokenId: number): Promise<[string, string, boolean]> {
        if (!this.assetNFTContract) throw new Error('Contract not initialized');

        return await this.assetNFTContract.getAssetDetails(tokenId);
    }

    async getOwnerOf(tokenId: number): Promise<string> {
        if (!this.assetNFTContract) throw new Error('Contract not initialized');

        return await this.assetNFTContract.ownerOf(tokenId);
    }

    async getTokenBalance(address: string): Promise<ethers.BigNumber> {
        if (!this.assetTokenContract) throw new Error('Contract not initialized');

        return await this.assetTokenContract.balanceOf(address);
    }
} 