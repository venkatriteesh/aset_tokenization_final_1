import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

// Web3Modal configuration
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID, // Use Infura for WalletConnect
    },
  },
  bitgetwallet: {
    package: true, // Bitget Wallet is automatically detected
  },
};

const web3Modal = new Web3Modal({
  network: "goerli", // Use Goerli testnet
  cacheProvider: true, // Enable caching
  providerOptions, // Add provider options
});

// Connect wallet function
export const connectWallet = async () => {
  try {
    const provider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};

// Disconnect wallet function
export const disconnectWallet = async () => {
  await web3Modal.clearCachedProvider();
};
