import { useState } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';
import { contractHelper } from '../utils/contractHelper.js';

interface AssetRegistrationFormProps {
  signer: ethers.JsonRpcSigner | null;
}

export const AssetRegistrationForm = ({ signer }: AssetRegistrationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [assetDetails, setAssetDetails] = useState({
    name: '',
    description: '',
    assetType: 'property',
    governmentId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      setStatus({
        message: 'Please connect your wallet first',
        type: 'error',
      });
      return;
    }

    if (!selectedFile) {
      setStatus({
        message: 'Please select an asset image',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Uploading to IPFS...', type: 'info' });

    try {
      // Initialize contract
      // Initialize contracts if needed
      // await contractHelper.initialize(signer);

      // Upload image to IPFS
      const imageHash = await uploadToIPFS(selectedFile);
      
      // Create and upload metadata
      const metadata = {
        name: assetDetails.name,
        description: assetDetails.description,
        assetType: assetDetails.assetType,
        governmentId: assetDetails.governmentId,
        image: `ipfs://${imageHash}`,
        attributes: [
          {
            trait_type: 'Asset Type',
            value: assetDetails.assetType
          },
          {
            trait_type: 'Government ID',
            value: assetDetails.governmentId
          }
        ]
      };
      
      const metadataHash = await uploadMetadataToIPFS(metadata);
      
      setStatus({ message: 'Minting NFT...', type: 'info' });
      
      // Mint NFT
      const contracts = {
        AssetNFT: {
          address: contractHelper.getContractAddress('AssetNFT', 31337), // Using localhost network
          abi: require('../contracts/AssetNFT.json').abi
        }
      };

      const result = await contractHelper.mintAsset(
        signer,
        contracts.AssetNFT.address,
        contracts.AssetNFT.abi,
        assetDetails.name, // Using name as assetId
        metadataHash.cid
      );

      setStatus({
        message: `Asset registered successfully! Token ID: ${result.tokenId}`,
        type: 'success',
      });

      // Reset form
      setAssetDetails({
        name: '',
        description: '',
        assetType: 'property',
        governmentId: '',
      });
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error registering asset:', error);
      setStatus({
        message: error instanceof Error ? error.message : 'Failed to register asset',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Register Asset</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Asset Name</label>
          <input
            type="text"
            value={assetDetails.name}
            onChange={(e) => setAssetDetails({ ...assetDetails, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={assetDetails.description}
            onChange={(e) => setAssetDetails({ ...assetDetails, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Asset Type</label>
          <select
            value={assetDetails.assetType}
            onChange={(e) => setAssetDetails({ ...assetDetails, assetType: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="property">Property</option>
            <option value="vehicle">Vehicle</option>
            <option value="art">Art</option>
            <option value="collectible">Collectible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Government ID</label>
          <input
            type="text"
            value={assetDetails.governmentId}
            onChange={(e) => setAssetDetails({ ...assetDetails, governmentId: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Asset Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>

        {status.message && (
          <div
            className={`p-4 rounded-md ${
              status.type === 'error'
                ? 'bg-red-50 text-red-700'
                : status.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !signer}
          className={`w-full rounded-md px-4 py-2 text-white font-medium ${
            isLoading || !signer
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Register Asset'}
        </button>
      </form>
    </div>
  );
}; 