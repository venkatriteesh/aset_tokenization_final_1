import axios from 'axios';

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export const uploadToIPFS = async (file: File): Promise<{cid: string}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'pinata_api_key': process.env.PINATA_API_KEY || '',
      'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY || ''
    }
  });
  
  return { cid: response.data.IpfsHash };
};

export const uploadMetadataToIPFS = async (metadata: object): Promise<{cid: string}> => {
  const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': process.env.PINATA_API_KEY || '',
      'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY || ''
    }
  });
  
  return { cid: response.data.IpfsHash };
};

export const validateIPFSConnection = async (): Promise<boolean> => {
  try {
    await axios.get(IPFS_GATEWAY + 'QmTudJMeshNtxX1nQwL1Z7JURkJeHJ6f7D4X4J4WY1v1X1');
    return true;
  } catch (error) {
    return false;
  }
};
