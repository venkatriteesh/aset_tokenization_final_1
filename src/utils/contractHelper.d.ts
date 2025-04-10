import type { JsonRpcSigner } from 'ethers';
import { Contract } from 'ethers';

export const contractHelper: {
  getContract: (address: string, abi: any[], signer: JsonRpcSigner) => Contract;
  initialize: (signer: JsonRpcSigner) => Promise<void>;
  mintAsset: (
    signer: JsonRpcSigner,
    contractAddress: string,
    abi: any[],
    assetId: string,
    tokenURI: string
  ) => Promise<any>;
  getContractAddress: (name: string, networkId: number) => string;
};
