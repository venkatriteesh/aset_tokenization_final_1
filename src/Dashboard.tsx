import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import axios from "axios";
import {
  Home,
  Plus,
  RefreshCw,
  Settings,
  Wallet,
  Shield,
  CreditCard,
  Send,
} from "lucide-react";
import React from "react";

// Pinata JWT (replace if needed)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMGQwNTcwYi01ZjhjLTRhOWEtYmY2MS0wZjA1YTRiZjdlZWEiLCJlbWFpbCI6InJpdGVlc2htb3R1cGFsbGkwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzg1MjEwMjhkYzBiYTc2ODRmMTUiLCJzY29wZWRLZXlTZWNyZXQiOiIzYjBjMmY1N2RjZWU2NTYxN2VmOGQ0MGJiNGVkMTYwMmVlZDExNzNkZGRiNTZmOTdmNzcyNWJmY2UxN2EyOTBiIiwiZXhwIjoxNzczODA5NzI1fQ.CiOMtPaiEICejGb1TFQYuHu0MCiFgmJqzEhAvcZqIgU";

// Type Definitions
interface ContractInfo {
  address: string;
  abi: any;
}

interface Contracts {
  AssetRegistry: ContractInfo;
  AssetNFT: ContractInfo;
  Escrow: ContractInfo;
}

interface WalletState {
  address: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
}

interface AssetDetails {
  name: string;
  description: string;
  type: string;
  governmentId: string;
  image: File | null;
}

// Load Contract ABIs (Update addresses from Remix)
const loadContracts = async (): Promise<Contracts> => {
  try {
    const contracts: Contracts = {
      AssetRegistry: { address: "0x9b7160f974d603f06aa2e414420c14b457ac93e6", abi: (await import("./contracts/AssetRegistry.json")).default },
      AssetNFT: { address: "0x2633eac8b98d75572ca2a37fe14a688b1203ffa0", abi: (await import("./contracts/AssetNFT.json")).default },
      Escrow: { address: "0x1d67b4faee0b30d942cb559fdccc22f77767b7e3", abi: (await import("./contracts/Escrow.json")).default },
    };
    console.log("Contracts loaded:", contracts);
    return contracts;
  } catch (error) {
    console.error("Failed to load contracts:", error);
    throw new Error("Failed to load contract ABIs: " + (error as Error).message);
  }
};

// Wallet Connection Utility (Adjusted for Remix/MetaMask)
const connectWallet = async (): Promise<WalletState> => {
  try {
    if (!window.ethereum) throw new Error("Please install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    // Remix JavaScript VM doesn't need chain switching; MetaMask might
    console.log("Connected chain ID:", chainId);

    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Wallet connected:", { address, chainId });
    return { provider, signer, address, chainId, isConnecting: false };
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

// Reusable Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = "default", className, children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`rounded-lg px-5 py-2.5 font-semibold transition-all duration-300 shadow-md
      ${variant === "default" ? "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]" : "bg-black text-white hover:bg-[#3B82F6] border border-[#3B82F6]"} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Enhanced Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`rounded-xl bg-white shadow-xl border border-[#3B82F6] ${className}`}
  >
    {children}
  </motion.div>
);

// Welcome Page Component
interface WelcomePageProps {
  onConnect: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onConnect }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen flex items-center justify-center bg-black text-white p-8"
  >
    <div className="text-center max-w-3xl">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold mb-4"
      >
        Unlock the Future of Assets
      </motion.h1>
      <Button onClick={onConnect} className="px-8 py-4 text-lg">
        <Wallet className="w-6 h-6 mr-2" /> Connect Wallet
      </Button>
    </div>
  </motion.div>
);

// User Info Modal
interface UserInfoModalProps {
  address: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ address, onSave, onClose }) => {
  const [name, setName] = useState<string>("");
  const existingUser = localStorage.getItem(`user_${address}`);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <Card className="p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-[#1E3A8A]">
          {existingUser ? `Welcome Back, ${JSON.parse(existingUser).name}!` : "New User Setup"}
        </h2>
        {!existingUser && (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
            />
            <Button onClick={() => name && onSave(name)} className="w-full mt-4" disabled={!name}>
              Save
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onClose} className="w-full mt-2">
          {existingUser ? "Proceed" : "Cancel"}
        </Button>
      </Card>
    </motion.div>
  );
};

// Asset Registration Form
interface AssetRegistrationFormProps {
  signer: ethers.Signer | null;
  walletAddress: string;
  contracts: Contracts | null;
  onAssetRegistered: () => void;
}

const AssetRegistrationForm: React.FC<AssetRegistrationFormProps> = ({ signer, walletAddress, contracts, onAssetRegistered }) => {
  const [assetDetails, setAssetDetails] = useState<AssetDetails>({ name: "", description: "", type: "property", governmentId: "", image: null });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastAssetId, setLastAssetId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAssetDetails((prev) => ({ ...prev, image: file }));
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "multipart/form-data" },
      });
      console.log("IPFS hash:", response.data.IpfsHash);
      return response.data.IpfsHash;
    } catch (error) {
      console.error("IPFS upload failed:", error);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !contracts?.AssetRegistry) {
      alert("Wallet not connected or contracts not loaded.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Starting asset registration...");
      console.log("Wallet address:", walletAddress);
      console.log("Contract address:", contracts.AssetRegistry.address);
      console.log("Input details:", assetDetails);

      // Validate inputs
      if (assetDetails.name.length === 0) throw new Error("Name cannot be empty");
      if (assetDetails.name.length > 100) throw new Error("Name exceeds 100 characters");
      if (assetDetails.description.length === 0) throw new Error("Description cannot be empty");
      if (assetDetails.description.length > 256) throw new Error("Description exceeds 256 characters");
      if (assetDetails.type.length === 0) throw new Error("Type cannot be empty");
      if (assetDetails.type.length > 50) throw new Error("Type exceeds 50 characters");
      if (assetDetails.governmentId.length === 0) throw new Error("Government ID cannot be empty");
      if (assetDetails.governmentId.length > 50) throw new Error("Government ID exceeds 50 characters");

      const cid = assetDetails.image ? await uploadToIPFS(assetDetails.image) : "";
      if (cid.length > 100) throw new Error("CID exceeds 100 characters");
      console.log("CID:", cid);

      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);

      // Verify deployment
      const code = await signer.provider!.getCode(contracts.AssetRegistry.address);
      console.log("Contract bytecode:", code.slice(0, 20) + "...");
      if (code === "0x") throw new Error(`No contract at ${contracts.AssetRegistry.address}`);

      // Check balance
      const balance = await signer.provider!.getBalance(walletAddress);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
      if (balance === 0n) throw new Error("Insufficient ETH");

      // Test call
      const assetCount = await registryContract.assetCount();
      console.log("Current assetCount:", assetCount.toString());

      // Gas estimation
      let gasLimit: bigint = 5000000n;
      try {
        const estimatedGas = await registryContract.registerAsset.estimateGas(
          assetDetails.name,
          assetDetails.description,
          assetDetails.type,
          assetDetails.governmentId,
          cid
        );
        gasLimit = (estimatedGas * 150n) / 100n;
        console.log("Estimated gas:", gasLimit.toString());
      } catch (error) {
        console.warn("Gas estimation failed, using fallback:", error);
      }

      // Execute transaction
      console.log("Sending transaction with params:", {
        name: assetDetails.name,
        description: assetDetails.description,
        type: assetDetails.type,
        governmentId: assetDetails.governmentId,
        cid,
        gasLimit: gasLimit.toString(),
      });
      const tx = await registryContract.registerAsset(
        assetDetails.name,
        assetDetails.description,
        assetDetails.type,
        assetDetails.governmentId,
        cid,
        { gasLimit }
      );
      console.log("Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      const event = receipt.logs
        .map((log) => {
          try {
            return registryContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "AssetRegistered");
      const newAssetId = event?.args.assetId.toString() || (await registryContract.assetCount() - 1n).toString();
      console.log("New asset ID:", newAssetId);
      setLastAssetId(newAssetId);
      alert(`Asset registered! ID: ${newAssetId}`);
      setAssetDetails({ name: "", description: "", type: "property", governmentId: "", image: null });
      onAssetRegistered();
    } catch (error: any) {
      console.error("Full error details:", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);
      console.log("Error data:", error.data);
      alert(`Failed to register asset: ${error.reason || error.message || "See console for details"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMintNFT = async () => {
    if (!signer || !walletAddress || !contracts?.AssetNFT || !lastAssetId) {
      alert("Register an asset first.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Minting NFT for asset ID:", lastAssetId);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const tx = await nftContract.mint(walletAddress, lastAssetId, { gasLimit: 1000000n });
      console.log("Mint tx hash:", tx.hash);
      await tx.wait();
      alert(`NFT minted! Token ID: ${lastAssetId}`);
      onAssetRegistered();
    } catch (error: any) {
      console.error("Mint error:", error);
      alert(`Failed to mint NFT: ${error.reason || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Register New Asset</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Asset Name (max 100 chars)"
          value={assetDetails.name}
          onChange={(e) => setAssetDetails({ ...assetDetails, name: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          required
          disabled={isSubmitting}
        />
        <textarea
          placeholder="Description (max 256 chars)"
          value={assetDetails.description}
          onChange={(e) => setAssetDetails({ ...assetDetails, description: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black min-h-[100px]"
          required
          disabled={isSubmitting}
        />
        <select
          value={assetDetails.type}
          onChange={(e) => setAssetDetails({ ...assetDetails, type: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          required
          disabled={isSubmitting}
        >
          <option value="property">Property</option>
          <option value="vehicle">Vehicle</option>
        </select>
        <input
          type="text"
          placeholder="Government ID (max 50 chars)"
          value={assetDetails.governmentId}
          onChange={(e) => setAssetDetails({ ...assetDetails, governmentId: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          required
          disabled={isSubmitting}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          disabled={isSubmitting}
        />
        {assetDetails.image && <p className="text-[#1E3A8A] text-sm">Selected: {assetDetails.image.name}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Asset"}
        </Button>
      </form>
      {lastAssetId && (
        <div className="mt-4">
          <p className="text-[#1E3A8A]">Asset ID: {lastAssetId}</p>
          <Button onClick={handleMintNFT} className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Minting..." : `Mint NFT for ID ${lastAssetId}`}
          </Button>
        </div>
      )}
    </Card>
  );
};

// Ownership Verification
interface OwnershipVerificationProps {
  signer: ethers.Signer | null;
  walletAddress: string;
  contracts: Contracts | null;
}

const OwnershipVerification: React.FC<OwnershipVerificationProps> = ({ signer, walletAddress, contracts }) => {
  const [verificationResult, setVerificationResult] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [ownedTokenIds, setOwnedTokenIds] = useState<string[]>([]);

  const fetchOwnedTokenIds = async () => {
    if (!signer || !contracts?.AssetNFT) return;
    const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
    try {
      const tokenCount = Number(await nftContract.tokenCount());
      const tokenIds: string[] = [];
      for (let i = 0; i < tokenCount; i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) tokenIds.push(i.toString());
        } catch {}
      }
      setOwnedTokenIds(tokenIds);
      console.log("Owned token IDs:", tokenIds);
    } catch (error) {
      console.error("Fetch owned tokens error:", error);
    }
  };

  useEffect(() => {
    fetchOwnedTokenIds();
  }, [signer, walletAddress, contracts]);

  const verifyOwnership = async () => {
    if (!signer || !contracts?.AssetNFT || !assetId) {
      alert("Select a Token ID.");
      return;
    }
    setIsVerifying(true);
    try {
      const contract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const owner = await contract.ownerOf(assetId);
      console.log(`Owner of token ${assetId}:`, owner);
      setVerificationResult(owner.toLowerCase() === walletAddress.toLowerCase() ? "Ownership verified!" : "Not the owner.");
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationResult(`Failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Verify Ownership</h2>
      <div className="space-y-5">
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          disabled={isVerifying}
        >
          <option value="">Select Token ID</option>
          {ownedTokenIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Or enter Token ID"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          disabled={isVerifying}
        />
        <Button onClick={verifyOwnership} disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
        {verificationResult && (
          <p className={`mt-4 ${verificationResult.includes("verified") ? "text-[#3B82F6]" : "text-red-600"}`}>
            {verificationResult}
          </p>
        )}
      </div>
    </Card>
  );
};

// Escrow & Payments
interface EscrowPaymentsProps {
  signer: ethers.Signer | null;
  contracts: Contracts | null;
}

const EscrowPayments: React.FC<EscrowPaymentsProps> = ({ signer, contracts }) => {
  const [escrowDetails, setEscrowDetails] = useState<{ amount: string; recipient: string }>({ amount: "", recipient: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEscrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !contracts?.Escrow || !ethers.isAddress(escrowDetails.recipient)) {
      alert("Invalid recipient address or wallet not connected.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Creating escrow:", escrowDetails);
      const contract = new ethers.Contract(contracts.Escrow.address, contracts.Escrow.abi, signer);
      const amount = ethers.parseEther(escrowDetails.amount);
      const tx = await contract.createEscrow(escrowDetails.recipient, { value: amount, gasLimit: 1000000n });
      console.log("Escrow tx hash:", tx.hash);
      await tx.wait();
      alert("Escrow created!");
      setEscrowDetails({ amount: "", recipient: "" });
    } catch (error: any) {
      console.error("Escrow error:", error);
      alert(`Failed: ${error.reason || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Escrow & Payments</h2>
      <form onSubmit={handleEscrowSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Recipient Address"
          value={escrowDetails.recipient}
          onChange={(e) => setEscrowDetails({ ...escrowDetails, recipient: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          required
          disabled={isSubmitting}
        />
        <input
          type="number"
          placeholder="Amount (ETH)"
          value={escrowDetails.amount}
          onChange={(e) => setEscrowDetails({ ...escrowDetails, amount: e.target.value })}
          className="w-full p-3 border border-[#3B82F6] rounded-lg text-black"
          required
          step="0.01"
          min="0"
          disabled={isSubmitting}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Escrow"}
        </Button>
      </form>
    </Card>
  );
};

// My Assets
interface Asset {
  id: number;
  name: string;
  type: string;
  governmentId: string;
  cid: string;
  tokenId: number | null;
}

interface MyAssetsProps {
  signer: ethers.Signer | null;
  walletAddress: string;
  contracts: Contracts | null;
  onTransferSuccess: () => void;
  refreshTrigger: number;
}

const MyAssets: React.FC<MyAssetsProps> = ({ signer, walletAddress, contracts, onTransferSuccess, refreshTrigger }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transferTo, setTransferTo] = useState<Record<number, string>>({});
  const [isTransferring, setIsTransferring] = useState<Record<number, boolean>>({});

  const fetchAssets = async () => {
    if (!signer || !contracts?.AssetRegistry || !contracts?.AssetNFT) return;
    setIsLoading(true);
    try {
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const assetCount = Number(await registryContract.assetCount());
      const fetchedAssets: Asset[] = [];
      for (let i = 0; i < assetCount; i++) {
        const asset = await registryContract.assets(i);
        let tokenId: number | null = null;
        try {
          const nftOwner = await nftContract.ownerOf(i);
          if (nftOwner.toLowerCase() === walletAddress.toLowerCase()) tokenId = i;
        } catch {}
        if (asset.owner.toLowerCase() === walletAddress.toLowerCase() || tokenId !== null) {
          fetchedAssets.push({ id: i, name: asset.name, type: asset.assetType, governmentId: asset.governmentId, cid: asset.cid, tokenId });
        }
      }
      setAssets(fetchedAssets);
      console.log("Fetched assets:", fetchedAssets);
    } catch (error) {
      console.error("Fetch assets error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [signer, walletAddress, contracts, refreshTrigger]);

  const handleTransferNFT = async (tokenId: number) => {
    if (!signer || !contracts?.AssetNFT || !transferTo[tokenId] || !ethers.isAddress(transferTo[tokenId])) {
      alert("Invalid address.");
      return;
    }
    setIsTransferring((prev) => ({ ...prev, [tokenId]: true }));
    try {
      console.log("Transferring NFT:", tokenId, "to:", transferTo[tokenId]);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const tx = await nftContract.transferFrom(walletAddress, transferTo[tokenId], tokenId, { gasLimit: 1000000n });
      await tx.wait();
      alert(`NFT transferred to ${transferTo[tokenId]}`);
      setTransferTo((prev) => ({ ...prev, [tokenId]: "" }));
      onTransferSuccess();
      fetchAssets();
    } catch (error: any) {
      console.error("NFT transfer error:", error);
      alert(`Failed: ${error.reason || error.message}`);
    } finally {
      setIsTransferring((prev) => ({ ...prev, [tokenId]: false }));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">My Assets</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : assets.length === 0 ? (
        <p>No assets found.</p>
      ) : (
        <ul className="space-y-6">
          {assets.map((asset) => (
            <motion.li key={asset.id} className="border-b pb-4" whileHover={{ scale: 1.02 }}>
              <span className="font-medium text-black">{asset.name}</span> - <span className="text-[#1E3A8A]">{asset.type}</span>
              <span className="text-[#1E3A8A] block text-sm">Asset ID: {asset.id}</span>
              {asset.tokenId !== null && <span className="text-[#1E3A8A] block text-sm">NFT Token ID: {asset.tokenId}</span>}
              {asset.tokenId !== null && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    value={transferTo[asset.tokenId] || ""}
                    onChange={(e) => setTransferTo((prev) => ({ ...prev, [asset.tokenId]: e.target.value }))}
                    className="w-full p-2 border border-[#3B82F6] rounded-lg text-black"
                    disabled={isTransferring[asset.tokenId]}
                  />
                  <Button
                    onClick={() => handleTransferNFT(asset.tokenId)}
                    disabled={isTransferring[asset.tokenId]}
                    className="flex items-center space-x-1"
                  >
                    <Send className="w-4 h-4" /> <span>{isTransferring[asset.tokenId] ? "Transferring..." : "Transfer NFT"}</span>
                  </Button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// Activity
interface Transaction {
  type: string;
  assetId: string;
  name: string;
  txHash: string;
  timestamp: number;
  from?: string;
  to?: string;
}

interface ActivityProps {
  signer: ethers.Signer | null;
  walletAddress: string;
  contracts: Contracts | null;
}

const Activity: React.FC<ActivityProps> = ({ signer, walletAddress, contracts }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    if (!signer || !contracts?.AssetRegistry || !contracts?.AssetNFT) return;
    setIsLoading(true);
    try {
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const registryEvents = await registryContract.queryFilter(registryContract.filters.AssetRegistered(null, walletAddress));
      const transferEvents = await nftContract.queryFilter(nftContract.filters.Transfer(null, null));
      const allTransactions: Transaction[] = [];
      registryEvents.forEach((event) =>
        allTransactions.push({
          type: "Registered",
          assetId: event.args.assetId.toString(),
          name: event.args.name,
          txHash: event.transactionHash,
          timestamp: event.blockNumber,
        })
      );
      transferEvents.forEach((event) => {
        const from = event.args.from;
        const to = event.args.to;
        const tokenId = event.args.tokenId.toString();
        if (from.toLowerCase() === ethers.ZeroAddress.toLowerCase() && to.toLowerCase() === walletAddress.toLowerCase()) {
          allTransactions.push({ type: "Minted", assetId: tokenId, name: `Asset ${tokenId}`, txHash: event.transactionHash, timestamp: event.blockNumber });
        } else if (from.toLowerCase() === walletAddress.toLowerCase()) {
          allTransactions.push({ type: "Transferred (Sent)", assetId: tokenId, name: `Asset ${tokenId}`, to, txHash: event.transactionHash, timestamp: event.blockNumber });
        } else if (to.toLowerCase() === walletAddress.toLowerCase()) {
          allTransactions.push({ type: "Transferred (Received)", assetId: tokenId, name: `Asset ${tokenId}`, from, txHash: event.transactionHash, timestamp: event.blockNumber });
        }
      });
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);
      console.log("Fetched transactions:", allTransactions);
    } catch (error) {
      console.error("Fetch transactions error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [signer, walletAddress, contracts]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Activity</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx, index) => (
            <motion.li key={index} className="border-b pb-2" whileHover={{ scale: 1.02 }}>
              <span className="font-medium text-black">{tx.type}: {tx.name}</span>
              <span className="text-[#1E3A8A] block text-sm">
                Asset ID: {tx.assetId} | Tx: {tx.txHash.slice(0, 10)}...
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// Settings
interface SettingsPanelProps {
  signer: ethers.Signer | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ signer }) => {
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const switchNetwork = async (networkId: string) => {
    if (!signer || !window.ethereum) return;
    setIsSwitching(true);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: networkId }] });
      alert("Network switched!");
    } catch (error: any) {
      console.error("Network switch error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Settings</h2>
      <div className="space-y-4">
        <Button onClick={() => switchNetwork("0x1")} disabled={isSwitching} className="w-full">
          {isSwitching ? "Switching..." : "Switch to Mainnet (for testing)"}
        </Button>
      </div>
    </Card>
  );
};

// Main Dashboard Component
const AssetTokenizationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("assets");
  const [walletState, setWalletState] = useState<WalletState>({
    address: "",
    provider: null,
    signer: null,
    chainId: null,
    isConnecting: false,
  });
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const [refreshAssets, setRefreshAssets] = useState<number>(0);
  const [isWelcome, setIsWelcome] = useState<boolean>(true);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  const handleConnectWallet = useCallback(async () => {
    if (walletState.isConnecting || walletState.address) return;
    setWalletState((prev) => ({ ...prev, isConnecting: true }));
    try {
      const walletData = await connectWallet();
      setWalletState({ ...walletData, isConnecting: false });
      setIsWelcome(false);
      const existingUser = localStorage.getItem(`user_${walletData.address}`);
      if (!existingUser) setShowUserModal(true);
      else setUserName(JSON.parse(existingUser).name);
    } catch (error: any) {
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
      alert(`Wallet connection failed: ${error.message}`);
    }
  }, [walletState]);

  const handleDisconnectWallet = useCallback(() => {
    setWalletState({ address: "", provider: null, signer: null, chainId: null, isConnecting: false });
    setIsWelcome(true);
    setUserName("");
    setShowUserModal(false);
  }, []);

  const handleAssetRegistered = () => setRefreshAssets((prev) => prev + 1);
  const handleTransferSuccess = () => setRefreshAssets((prev) => prev + 1);

  useEffect(() => {
    loadContracts()
      .then(setContracts)
      .catch((error) => alert("Failed to load contracts: " + (error as Error).message));
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) handleDisconnectWallet();
      else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = accounts[0];
        const chainId = Number((await provider.getNetwork()).chainId);
        setWalletState({ provider, signer, address, chainId, isConnecting: false });
        const existingUser = localStorage.getItem(`user_${address}`);
        if (!existingUser) setShowUserModal(true);
        else setUserName(JSON.parse(existingUser).name);
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [handleDisconnectWallet]);

  if (!contracts) return <div className="min-h-screen flex items-center justify-center text-[#1E3A8A] bg-black">Loading contracts...</div>;

  return (
    <AnimatePresence>
      {isWelcome ? (
        <WelcomePage onConnect={handleConnectWallet} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-black p-4 md:p-8"
        >
          <motion.header
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 rounded-2xl mb-8 border border-[#3B82F6] sticky top-0 z-20"
          >
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-[#3B82F6]" />
                <h1 className="text-2xl font-bold text-[#1E3A8A]">Asset Tokenization</h1>
              </div>
              <div className="flex items-center space-x-4">
                {userName && <span className="text-[#1E3A8A] font-semibold">Welcome, {userName}!</span>}
                <Button className="space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>{`${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`}</span>
                </Button>
                <Button variant="outline" onClick={handleDisconnectWallet}>
                  Disconnect
                </Button>
              </div>
            </div>
          </motion.header>

          {showUserModal && (
            <UserInfoModal
              address={walletState.address}
              onSave={(name) => {
                localStorage.setItem(`user_${walletState.address}`, JSON.stringify({ name, address: walletState.address }));
                setUserName(name);
                setShowUserModal(false);
              }}
              onClose={() => setShowUserModal(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="p-4 hidden lg:block">
              <nav className="space-y-2">
                {[
                  { id: "assets", icon: Home, label: "My Assets" },
                  { id: "mint", icon: Plus, label: "Create Asset" },
                  { id: "verify", icon: Shield, label: "Verify Ownership" },
                  { id: "transactions", icon: RefreshCw, label: "Activity" },
                  { id: "escrow", icon: CreditCard, label: "Escrow & Payments" },
                  { id: "settings", icon: Settings, label: "Settings" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start px-4 py-3 ${activeTab === item.id ? "bg-[#3B82F6] text-white" : "text-black hover:bg-[#3B82F6] hover:text-white"}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </Card>

            <div className="col-span-1 lg:col-span-3">
              {activeTab === "assets" && (
                <MyAssets
                  signer={walletState.signer}
                  walletAddress={walletState.address}
                  contracts={contracts}
                  onTransferSuccess={handleTransferSuccess}
                  refreshTrigger={refreshAssets}
                />
              )}
              {activeTab === "mint" && (
                <AssetRegistrationForm
                  signer={walletState.signer}
                  walletAddress={walletState.address}
                  contracts={contracts}
                  onAssetRegistered={handleAssetRegistered}
                />
              )}
              {activeTab === "verify" && (
                <OwnershipVerification signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} />
              )}
              {activeTab === "transactions" && (
                <Activity signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} />
              )}
              {activeTab === "escrow" && <EscrowPayments signer={walletState.signer} contracts={contracts} />}
              {activeTab === "settings" && <SettingsPanel signer={walletState.signer} />}
            </div>
          </div>

          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 rounded-t-2xl p-2 flex justify-around lg:hidden z-20 border-t border-[#3B82F6]"
          >
            {[
              { id: "assets", icon: Home },
              { id: "mint", icon: Plus },
              { id: "verify", icon: Shield },
              { id: "transactions", icon: RefreshCw },
              { id: "escrow", icon: CreditCard },
              { id: "settings", icon: Settings },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`p-2 ${activeTab === item.id ? "bg-[#3B82F6] text-white" : "text-black hover:bg-[#3B82F6] hover:text-white"}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-6 h-6" />
              </Button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssetTokenizationDashboard;