import { ethers } from 'ethers';

const NFT_CONTRACT_ABI = [
    "function mintAsset(string _name, string _description, string _assetType, string _governmentId, string _ipfsHash) public returns (uint256)",
    "function getAsset(uint256 _tokenId) public view returns (tuple(string name, string description, string assetType, string governmentId, bool verified, string ipfsHash))",
    "function getOwnerAssets(address _owner) public view returns (uint256[])",
    "function verifyAsset(uint256 _tokenId) public",
    "function transferAsset(address _to, uint256 _tokenId) public",
    "event AssetMinted(uint256 indexed tokenId, address indexed owner)",
    "event AssetVerified(uint256 indexed tokenId)"
];

export class ContractHelper {
    private contract: ethers.Contract | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    async initialize(signer: ethers.JsonRpcSigner) {
        try {
            this.signer = signer;
            const contractAddress = import.meta.env.VITE_ASSET_NFT_ADDRESS;
            
            if (!contractAddress) {
                throw new Error('Contract address not found in environment variables');
            }

            this.contract = new ethers.Contract(
                contractAddress,
                NFT_CONTRACT_ABI,
                signer
            );

            return true;
        } catch (error) {
            console.error('Failed to initialize contract:', error);
            return false;
        }
    }

    async mintAsset(
        name: string,
        description: string,
        assetType: string,
        governmentId: string,
        ipfsHash: string
    ) {
        if (!this.contract) throw new Error('Contract not initialized');

        try {
            const tx = await this.contract.mintAsset(
                name,
                description,
                assetType,
                governmentId,
                ipfsHash
            );
            const receipt = await tx.wait();
            
            // Find the AssetMinted event
            const event = receipt.events?.find(
                (e: any) => e.event === 'AssetMinted'
            );
            
            return {
                success: true,
                tokenId: event?.args?.tokenId.toString(),
                transactionHash: receipt.hash
            };
        } catch (error) {
            console.error('Error minting asset:', error);
            throw error;
        }
    }

    async getAsset(tokenId: number) {
        if (!this.contract) throw new Error('Contract not initialized');

        try {
            const asset = await this.contract.getAsset(tokenId);
            return {
                name: asset.name,
                description: asset.description,
                assetType: asset.assetType,
                governmentId: asset.governmentId,
                verified: asset.verified,
                ipfsHash: asset.ipfsHash
            };
        } catch (error) {
            console.error('Error getting asset:', error);
            throw error;
        }
    }

    async getOwnerAssets(ownerAddress: string) {
        if (!this.contract) throw new Error('Contract not initialized');

        try {
            const tokenIds = await this.contract.getOwnerAssets(ownerAddress);
            return tokenIds.map((id: ethers.BigNumberish) => id.toString());
        } catch (error) {
            console.error('Error getting owner assets:', error);
            throw error;
        }
    }
}

export const contractHelper = new ContractHelper(); 