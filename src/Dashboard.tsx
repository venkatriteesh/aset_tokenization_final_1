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

// Pinata JWT
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMGQwNTcwYi01ZjhjLTRhOWEtYmY2MS0wZjA1YTRiZjdlZWEiLCJlbWFpbCI6InJpdGVlc2htb3R1cGFsbGkwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzg1MjEwMjhkYzBiYTc2ODRmMTUiLCJzY29wZWRLZXlTZWNyZXQiOiIzYjBjMmY1N2RjZWU2NTYxN2VmOGQ0MGJiNGVkMTYwMmVlZDExNzNkZGRiNTZmOTdmNzcyNWJmY2UxN2EyOTBiIiwiZXhwIjoxNzczODA5NzI1fQ.CiOMtPaiEICejGb1TFQYuHu0MCiFgmJqzEhAvcZqIgU";

// Load Contract ABIs with Debugging
const loadContracts = async () => {
  try {
    const contracts = {
      AssetRegistry: { address: "0x80ab5579b87a51f9926a2e1319c7bfc9e906d7a0", abi: (await import("./contracts/AssetRegistry.json")).default },
      AssetNFT: { address: "0xd2f9449772f5299d610e36728f39f6a43358fdee", abi: (await import("./contracts/AssetNFT.json")).default },
      Escrow: { address: "0x432ae2ae237b6f93f04c4b368b3b3a60e9cc461d", abi: (await import("./contracts/Escrow.json")).default },
    };
    console.log("Loaded contracts:", contracts);
    return contracts;
  } catch (error) {
    console.error("Failed to load contracts:", error);
    throw error;
  }
};

// Wallet Connection Utility
const connectWallet = async () => {
  try {
    if (!window.ethereum) throw new Error("Please install MetaMask or another Web3 wallet");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (chainId !== 1337) throw new Error(`Please switch to Ganache network (Chain ID 1337). Current Chain ID: ${chainId}`);
      return { provider, signer, address, chainId };
    }
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    if (chainId !== 1337) throw new Error(`Please switch to Ganache network (Chain ID 1337). Current Chain ID: ${chainId}`);
    console.log("Connected Network:", { chainId, name: network.name });
    return { provider, signer, address, chainId };
  } catch (error) {
    if (error.code === -32002) throw new Error("A wallet connection request is already pending in MetaMask.");
    throw error;
  }
};

// Reusable Button Component
const Button = ({ variant = "default", className, children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
    whileTap={{ scale: 0.95 }}
    className={`relative rounded-lg px-5 py-2.5 font-semibold transition-all duration-300 shadow-md
      ${variant === "default" ? "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]" : "bg-black text-white hover:bg-[#3B82F6] border border-[#3B82F6]"} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Enhanced Card Component
const Card = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`rounded-xl bg-white shadow-xl border border-[#3B82F6] ${className}`}
  >
    {children}
  </motion.div>
);

// Welcome Page Component (Modernized)
const WelcomePage = ({ onConnect }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen flex items-center justify-center bg-black text-white p-8 relative overflow-hidden"
  >
    {/* 3D Background Animation */}
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background: [
          "radial-gradient(circle at 20% 30%, #3B82F6 10%, transparent 50%)",
          "radial-gradient(circle at 80% 70%, #1E3A8A 10%, transparent 50%)",
          "radial-gradient(circle at 50% 50%, #3B82F6 10%, transparent 50%)",
        ],
      }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      style={{ opacity: 0.3 }}
    />
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ rotate: [0, 360] }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      style={{
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
        opacity: 0.2,
      }}
    />
    <div className="text-center z-10 max-w-3xl">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
      >
        Unlock the Future of Assets
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg md:text-xl mb-8 text-gray-300"
      >
        Tokenize, manage, and trade your assets securely on the blockchain. Join the decentralized revolution today.
      </motion.p>
      <Button
        onClick={onConnect}
        className="px-8 py-4 text-lg bg-[#3B82F6] hover:bg-[#1E3A8A] glow-effect"
      >
        <Wallet className="w-6 h-6 mr-2" /> Connect Wallet
      </Button>
    </div>
  </motion.div>
);

// User Info Modal
const UserInfoModal = ({ address, onSave, onClose }) => {
  const [name, setName] = useState("");
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
              className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black"
            />
            <Button
              onClick={() => {
                if (name) {
                  localStorage.setItem(`user_${address}`, JSON.stringify({ name, address }));
                  onSave(name);
                }
              }}
              className="w-full mt-4"
            >
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

// Asset Registration Form (unchanged)
const AssetRegistrationForm = ({ signer, walletAddress, contracts, onAssetRegistered }) => {
  const [assetDetails, setAssetDetails] = useState({ name: "", description: "", type: "property", governmentId: "", image: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAssetId, setLastAssetId] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setAssetDetails((prev) => ({ ...prev, image: file }));
  };

  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "multipart/form-data" },
    });
    return response.data.IpfsHash;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer || !contracts || !contracts.AssetRegistry) return alert("Please connect your wallet");
    setIsSubmitting(true);
    try {
      let cid = assetDetails.image ? await uploadToIPFS(assetDetails.image) : "";
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const tx = await registryContract.registerAsset(assetDetails.name, assetDetails.description, assetDetails.type, assetDetails.governmentId, cid, { gasLimit: 500000 });
      const receipt = await tx.wait();
      const newAssetId = receipt.logs
        .filter(log => log.address.toLowerCase() === contracts.AssetRegistry.address.toLowerCase())
        .map(log => registryContract.interface.parseLog(log))
        .filter(parsed => parsed.name === "AssetRegistered")
        .map(parsed => parsed.args.assetId.toString())[0];
      setLastAssetId(newAssetId);
      alert(`Asset registered! ID: ${newAssetId}`);
      setAssetDetails({ name: "", description: "", type: "property", governmentId: "", image: null });
      onAssetRegistered();
    } catch (error) {
      alert("Failed to register asset: " + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMintNFT = async () => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetNFT || !lastAssetId) return alert("Register an asset first");
    setIsSubmitting(true);
    try {
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const tx = await nftContract.mint(walletAddress, lastAssetId, { gasLimit: 500000 });
      await tx.wait();
      alert(`NFT minted! Token ID: ${lastAssetId}`);
      onAssetRegistered();
    } catch (error) {
      alert("Failed to mint NFT: " + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Register New Asset</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" placeholder="Asset Name" value={assetDetails.name} onChange={(e) => setAssetDetails({ ...assetDetails, name: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" required disabled={isSubmitting} />
        <textarea placeholder="Asset Description" value={assetDetails.description} onChange={(e) => setAssetDetails({ ...assetDetails, description: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black min-h-[100px]" required disabled={isSubmitting} />
        <select value={assetDetails.type} onChange={(e) => setAssetDetails({ ...assetDetails, type: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" required disabled={isSubmitting}>
          <option value="property">Property</option>
          <option value="vehicle">Vehicle</option>
        </select>
        <input type="text" placeholder="Government ID" value={assetDetails.governmentId} onChange={(e) => setAssetDetails({ ...assetDetails, governmentId: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" required disabled={isSubmitting} />
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-3 border border-[#3B82F6] rounded-lg text-black" disabled={isSubmitting} />
        {assetDetails.image && <p className="text-[#1E3A8A] text-sm">Selected: {assetDetails.image.name}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Registering..." : "Register Asset"}</Button>
      </form>
      {lastAssetId && (
        <div className="mt-4">
          <p className="text-[#1E3A8A]">Asset ID: {lastAssetId}</p>
          <Button onClick={handleMintNFT} className="w-full mt-2" disabled={isSubmitting}>{isSubmitting ? "Minting..." : `Mint NFT for ID ${lastAssetId}`}</Button>
        </div>
      )}
    </Card>
  );
};

// Ownership Verification (unchanged)
const OwnershipVerification = ({ signer, walletAddress, contracts }) => {
  const [verificationResult, setVerificationResult] = useState("");
  const [assetId, setAssetId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [ownedTokenIds, setOwnedTokenIds] = useState([]);

  const fetchOwnedTokenIds = async () => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetNFT) return;
    const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
    const tokenCount = await nftContract.tokenCount();
    const tokenIds = [];
    for (let i = 0; i < tokenCount; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        if (owner.toLowerCase() === walletAddress.toLowerCase()) tokenIds.push(i.toString());
      } catch (error) {}
    }
    setOwnedTokenIds(tokenIds);
  };

  useEffect(() => { fetchOwnedTokenIds(); }, [signer, walletAddress, contracts]);

  const verifyOwnership = async () => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetNFT || !assetId) return alert("Select a Token ID");
    setIsVerifying(true);
    try {
      const contract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const owner = await contract.ownerOf(assetId);
      setVerificationResult(owner.toLowerCase() === walletAddress.toLowerCase() ? "Ownership verified!" : "Not the owner.");
    } catch (error) {
      setVerificationResult("Failed to verify: " + (error.reason || error.message));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Verify Ownership</h2>
      <div className="space-y-5">
        <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" disabled={isVerifying}>
          <option value="">Select Token ID</option>
          {ownedTokenIds.map((id) => <option key={id} value={id}>{id}</option>)}
        </select>
        <input type="text" placeholder="Or enter Token ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" disabled={isVerifying} />
        <Button onClick={verifyOwnership} disabled={isVerifying}>{isVerifying ? "Verifying..." : "Verify"}</Button>
        {verificationResult && <p className={`mt-4 font-medium ${verificationResult.includes("verified") ? "text-[#3B82F6]" : "text-red-600"}`}>{verificationResult}</p>}
      </div>
    </Card>
  );
};

// Escrow & Payments (unchanged)
const EscrowPayments = ({ signer, contracts }) => {
  const [escrowDetails, setEscrowDetails] = useState({ amount: "", recipient: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEscrowSubmit = async (e) => {
    e.preventDefault();
    if (!signer || !contracts || !contracts.Escrow) return alert("Connect wallet");
    setIsSubmitting(true);
    try {
      const contract = new ethers.Contract(contracts.Escrow.address, contracts.Escrow.abi, signer);
      const tx = await contract.createEscrow(escrowDetails.recipient, { value: ethers.parseEther(escrowDetails.amount) });
      await tx.wait();
      alert("Escrow created!");
      setEscrowDetails({ amount: "", recipient: "" });
    } catch (error) {
      alert("Failed to create escrow: " + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Escrow & Payments</h2>
      <form onSubmit={handleEscrowSubmit} className="space-y-5">
        <input type="text" placeholder="Recipient Address" value={escrowDetails.recipient} onChange={(e) => setEscrowDetails({ ...escrowDetails, recipient: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" required disabled={isSubmitting} />
        <input type="number" placeholder="Amount (ETH)" value={escrowDetails.amount} onChange={(e) => setEscrowDetails({ ...escrowDetails, amount: e.target.value })} className="w-full p-3 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" required disabled={isSubmitting} step="0.01" min="0" />
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Escrow"}</Button>
      </form>
    </Card>
  );
};

// My Assets (unchanged)
const MyAssets = ({ signer, walletAddress, contracts, onTransferSuccess, refreshTrigger }) => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transferTo, setTransferTo] = useState({});
  const [isTransferring, setIsTransferring] = useState({});

  const fetchAssets = async () => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetRegistry || !contracts.AssetNFT) return;
    setIsLoading(true);
    try {
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const assetCount = await registryContract.assetCount();
      const fetchedAssets = [];
      for (let i = 0; i < assetCount; i++) {
        const asset = await registryContract.assets(i);
        let tokenId = null;
        try {
          const nftOwner = await nftContract.ownerOf(i);
          if (nftOwner.toLowerCase() === walletAddress.toLowerCase()) tokenId = i;
        } catch (error) {}
        if (asset.owner.toLowerCase() === walletAddress.toLowerCase() || tokenId !== null) {
          fetchedAssets.push({ id: i, name: asset.name, type: asset.assetType, governmentId: asset.governmentId, cid: asset.cid, tokenId });
        }
      }
      setAssets(fetchedAssets);
    } catch (error) {
      console.error("Fetch Assets Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [signer, walletAddress, contracts, refreshTrigger]);

  const handleTransferOwnership = async (assetId) => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetRegistry || !transferTo[assetId] || !ethers.isAddress(transferTo[assetId])) return alert("Enter a valid address");
    setIsTransferring((prev) => ({ ...prev, [assetId]: true }));
    try {
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const tx = await registryContract.transferOwnership(assetId, transferTo[assetId], { gasLimit: 500000 });
      await tx.wait();
      alert(`Ownership transferred to ${transferTo[assetId]}`);
      setTransferTo((prev) => ({ ...prev, [assetId]: "" }));
      onTransferSuccess();
      fetchAssets();
    } catch (error) {
      alert("Failed to transfer: " + (error.reason || error.message));
    } finally {
      setIsTransferring((prev) => ({ ...prev, [assetId]: false }));
    }
  };

  const handleTransferNFT = async (tokenId) => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetNFT || !transferTo[tokenId] || !ethers.isAddress(transferTo[tokenId])) return alert("Enter a valid address");
    setIsTransferring((prev) => ({ ...prev, [tokenId]: true }));
    try {
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const tx = await nftContract.transferFrom(walletAddress, transferTo[tokenId], tokenId, { gasLimit: 500000 });
      await tx.wait();
      alert(`NFT transferred to ${transferTo[tokenId]}`);
      setTransferTo((prev) => ({ ...prev, [tokenId]: "" }));
      onTransferSuccess();
      fetchAssets();
    } catch (error) {
      alert("Failed to transfer NFT: " + (error.reason || error.message));
    } finally {
      setIsTransferring((prev) => ({ ...prev, [tokenId]: false }));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">My Assets</h2>
      {isLoading ? <p className="text-[#1E3A8A]">Loading...</p> : assets.length === 0 ? <p className="text-[#1E3A8A]">No assets found.</p> : (
        <ul className="space-y-6">
          {assets.map((asset) => (
            <motion.li key={asset.id} className="border-b border-[#3B82F6] pb-4" whileHover={{ scale: 1.02 }}>
              <span className="font-medium text-black">{asset.name}</span> - <span className="text-[#1E3A8A]">{asset.type}</span>
              <span className="text-[#1E3A8A] block text-sm">Asset ID: {asset.id}</span>
              <span className="text-[#1E3A8A] block text-sm">Government ID: {asset.governmentId}</span>
              {asset.cid && (
                <div className="mt-2">
                  <img src={`https://gateway.pinata.cloud/ipfs/${asset.cid}`} alt={asset.name} className="w-32 h-32 object-cover rounded-lg" onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")} />
                  <span className="text-[#1E3A8A] block text-sm">IPFS CID: {asset.cid}</span>
                </div>
              )}
              <div className="mt-2">
                {asset.tokenId !== null && <span className="text-[#1E3A8A] block text-sm">NFT Token ID: {asset.tokenId}</span>}
                <div className="flex items-center space-x-2 mt-2">
                  <input type="text" placeholder="New Owner Address" value={transferTo[asset.id] || ""} onChange={(e) => setTransferTo((prev) => ({ ...prev, [asset.id]: e.target.value }))} className="w-full p-2 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" disabled={isTransferring[asset.id]} />
                  <Button onClick={() => handleTransferOwnership(asset.id)} disabled={isTransferring[asset.id]} className="flex items-center space-x-1"><Send className="w-4 h-4" /> <span>{isTransferring[asset.id] ? "Transferring..." : "Transfer"}</span></Button>
                </div>
                {asset.tokenId !== null && (
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="text" placeholder="NFT Recipient Address" value={transferTo[asset.tokenId] || ""} onChange={(e) => setTransferTo((prev) => ({ ...prev, [asset.tokenId]: e.target.value }))} className="w-full p-2 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#1E3A8A] text-black" disabled={isTransferring[asset.tokenId]} />
                    <Button onClick={() => handleTransferNFT(asset.tokenId)} disabled={isTransferring[asset.tokenId]} className="flex items-center space-x-1"><Send className="w-4 h-4" /> <span>{isTransferring[asset.tokenId] ? "Transferring..." : "Transfer NFT"}</span></Button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// Activity (unchanged)
const Activity = ({ signer, walletAddress, contracts }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!signer || !walletAddress || !contracts || !contracts.AssetRegistry || !contracts.AssetNFT) return;
    setIsLoading(true);
    try {
      const registryContract = new ethers.Contract(contracts.AssetRegistry.address, contracts.AssetRegistry.abi, signer);
      const nftContract = new ethers.Contract(contracts.AssetNFT.address, contracts.AssetNFT.abi, signer);
      const registryEvents = await registryContract.queryFilter(registryContract.filters.AssetRegistered(null, walletAddress, null));
      const transferEvents = await nftContract.queryFilter(nftContract.filters.Transfer(null, null, null));
      const allTransactions = [];
      registryEvents.forEach((event) => allTransactions.push({ type: "Registered", assetId: event.args.assetId.toString(), name: event.args.name, txHash: event.transactionHash, timestamp: event.blockNumber }));
      transferEvents.forEach((event) => {
        const from = event.args.sender;
        const to = event.args.receiver;
        const tokenId = event.args.tokenId.toString();
        if (from.toLowerCase() === ethers.ZeroAddress.toLowerCase() && to.toLowerCase() === walletAddress.toLowerCase()) allTransactions.push({ type: "Minted", assetId: tokenId, name: `Asset ${tokenId}`, txHash: event.transactionHash, timestamp: event.blockNumber });
        else if (from.toLowerCase() === walletAddress.toLowerCase()) allTransactions.push({ type: "Transferred (Sent)", assetId: tokenId, name: `Asset ${tokenId}`, to, txHash: event.transactionHash, timestamp: event.blockNumber });
        else if (to.toLowerCase() === walletAddress.toLowerCase()) allTransactions.push({ type: "Transferred (Received)", assetId: tokenId, name: `Asset ${tokenId}`, from, txHash: event.transactionHash, timestamp: event.blockNumber });
      });
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [signer, walletAddress, contracts]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Activity</h2>
      {isLoading ? <p className="text-[#1E3A8A]">Loading...</p> : transactions.length === 0 ? <p className="text-[#1E3A8A]">No transactions.</p> : (
        <ul className="space-y-4">
          {transactions.map((tx, index) => (
            <motion.li key={index} className="border-b border-[#3B82F6] pb-2" whileHover={{ scale: 1.02 }}>
              <span className="font-medium text-black">{tx.type}: {tx.name}</span>
              <span className="text-[#1E3A8A] block text-sm">Asset ID: {tx.assetId} | Tx: {tx.txHash.slice(0, 10)}... {tx.from && `| From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`} {tx.to && `| To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// Settings (unchanged)
const SettingsPanel = ({ signer }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const switchNetwork = async (networkId) => {
    if (!signer || !window.ethereum) return alert("Connect wallet");
    setIsSwitching(true);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: networkId }] });
      alert("Network switched!");
    } catch (error) {
      alert("Failed to switch: " + (error.message || error.reason));
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A]">Settings</h2>
      <div className="space-y-4">
        <Button onClick={() => switchNetwork("0x7A69")} disabled={isSwitching} className="w-full">{isSwitching ? "Switching..." : "Switch to Ganache"}</Button>
        <Button onClick={() => switchNetwork("0xAA36A7")} disabled={isSwitching} className="w-full">{isSwitching ? "Switching..." : "Switch to Sepolia"}</Button>
      </div>
    </Card>
  );
};

// Main Dashboard Component
export default function AssetTokenizationDashboard() {
  const [activeTab, setActiveTab] = useState("assets");
  const [walletState, setWalletState] = useState({ address: "", provider: null, signer: null, chainId: null, isConnecting: false });
  const [contracts, setContracts] = useState(null);
  const [refreshAssets, setRefreshAssets] = useState(0);
  const [isWelcome, setIsWelcome] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState("");

  const handleConnectWallet = useCallback(async () => {
    if (walletState.isConnecting || walletState.address) return;
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true }));
      const walletData = await connectWallet();
      setWalletState({ ...walletData, isConnecting: false });
      setIsWelcome(false);
      const existingUser = localStorage.getItem(`user_${walletData.address}`);
      if (!existingUser) setShowUserModal(true);
      else setUserName(JSON.parse(existingUser).name);
    } catch (error) {
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
      alert(error.message);
    }
  }, [walletState]);

  const handleDisconnectWallet = useCallback(() => {
    setWalletState({ address: "", provider: null, signer: null, chainId: null, isConnecting: false });
    setIsWelcome(true);
    setUserName("");
  }, []);

  const handleAssetRegistered = () => setRefreshAssets((prev) => prev + 1);
  const handleTransferSuccess = () => setRefreshAssets((prev) => prev + 1);

  useEffect(() => {
    loadContracts().then(setContracts).catch((error) => alert("Failed to load contracts: " + error.message));
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) handleDisconnectWallet();
      else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = accounts[0];
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        setWalletState({ provider, signer, address, chainId, isConnecting: false });
        const existingUser = localStorage.getItem(`user_${address}`);
        if (!existingUser) setShowUserModal(true);
        else setUserName(JSON.parse(existingUser).name);
      }
    };
    const handleChainChanged = (chainId) => {
      setWalletState((prev) => ({ ...prev, chainId: Number(chainId) }));
      if (Number(chainId) !== 1337) alert("Switch back to Ganache (Chain ID 1337)");
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
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
          className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-black p-4 md:p-8 relative overflow-hidden"
        >
          {/* Dashboard Background Animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            style={{ background: "linear-gradient(45deg, #3B82F6, transparent)", opacity: 0.1 }}
          />
          <motion.header
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-md shadow-md rounded-2xl mb-8 border border-[#3B82F6] sticky top-0 z-20"
          >
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Shield className="w-8 h-8 text-[#3B82F6]" />
                </motion.div>
                <h1 className="text-2xl font-bold text-[#1E3A8A]">Asset Tokenization</h1>
              </div>
              <div className="flex items-center space-x-4">
                {userName && <span className="text-[#1E3A8A] font-semibold">Welcome, {userName}!</span>}
                <Button className="space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>{`${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`}</span>
                </Button>
                <Button variant="outline" onClick={handleDisconnectWallet} className="hover:bg-[#3B82F6]">Disconnect</Button>
              </div>
            </div>
          </motion.header>

          {showUserModal && (
            <UserInfoModal
              address={walletState.address}
              onSave={(name) => {
                setUserName(name);
                setShowUserModal(false);
              }}
              onClose={() => setShowUserModal(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {/* Desktop Sidebar */}
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
                  <motion.div whileHover={{ x: 5 }} key={item.id}>
                    <Button
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start px-4 py-3 text-sm font-medium ${activeTab === item.id ? "bg-[#3B82F6] text-white" : "text-black hover:bg-[#3B82F6] hover:text-white"}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
              </nav>
            </Card>

            {/* Main Content */}
            <div className="col-span-1 lg:col-span-3">
              {activeTab === "assets" && <MyAssets signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} onTransferSuccess={handleTransferSuccess} refreshTrigger={refreshAssets} />}
              {activeTab === "mint" && <AssetRegistrationForm signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} onAssetRegistered={handleAssetRegistered} />}
              {activeTab === "verify" && <OwnershipVerification signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} />}
              {activeTab === "transactions" && <Activity signer={walletState.signer} walletAddress={walletState.address} contracts={contracts} />}
              {activeTab === "escrow" && <EscrowPayments signer={walletState.signer} contracts={contracts} />}
              {activeTab === "settings" && <SettingsPanel signer={walletState.signer} />}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg rounded-t-2xl p-2 flex justify-around lg:hidden z-20 border-t border-[#3B82F6]"
          >
            {[
              { id: "assets", icon: Home },
              { id: "mint", icon: Plus },
              { id: "verify", icon: Shield },
              { id: "transactions", icon: RefreshCw },
              { id: "escrow", icon: CreditCard },
              { id: "settings", icon: Settings },
            ].map((item) => (
              <motion.div key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`p-2 ${activeTab === item.id ? "bg-[#3B82F6] text-white" : "text-black hover:bg-[#3B82F6] hover:text-white"}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-6 h-6" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom CSS for glow effect
const customStyles = `
  .glow-effect {
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.3);
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);