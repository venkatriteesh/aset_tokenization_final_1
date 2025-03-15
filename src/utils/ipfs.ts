import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Configure IPFS client (using Infura's IPFS gateway)
const projectId = import.meta.env.VITE_INFURA_IPFS_PROJECT_ID;
const projectSecret = import.meta.env.VITE_INFURA_IPFS_PROJECT_SECRET;

if (!projectId || !projectSecret) {
    throw new Error('IPFS credentials not found in environment variables');
}

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

export interface Metadata {
    name: string;
    description: string;
    image: string;
    assetType: string;
    governmentId: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
}

export const uploadToIPFS = async (file: File): Promise<string> => {
    try {
        const added = await client.add(
            file,
            {
                progress: (prog) => console.log(`Uploading file: ${prog}`)
            }
        );
        // Use Infura's dedicated gateway for better reliability
        const url = `https://${projectId}.infura-ipfs.io/ipfs/${added.path}`;
        console.log('File uploaded to IPFS:', url);
        return url;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload file to IPFS');
    }
};

export const uploadMetadataToIPFS = async (metadata: Metadata): Promise<string> => {
    try {
        const data = JSON.stringify(metadata);
        const added = await client.add(
            data,
            {
                progress: (prog) => console.log(`Uploading metadata: ${prog}`)
            }
        );
        // Use Infura's dedicated gateway for better reliability
        const url = `https://${projectId}.infura-ipfs.io/ipfs/${added.path}`;
        console.log('Metadata uploaded to IPFS:', url);
        return url;
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to IPFS');
    }
};

// Helper function to validate IPFS connection
export const validateIPFSConnection = async (): Promise<boolean> => {
    try {
        // Try to add a small test object
        const testData = { test: 'connection' };
        const added = await client.add(JSON.stringify(testData));
        console.log('IPFS connection validated:', added.path);
        return true;
    } catch (error) {
        console.error('IPFS connection failed:', error);
        return false;
    }
}; 