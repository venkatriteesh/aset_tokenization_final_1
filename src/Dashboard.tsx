import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import {
  Home,
  Plus,
  RefreshCw,
  Settings,
  Wallet,
  Shield,
  CreditCard,
} from "lucide-react";

// Wallet connection configurations
const walletConnect = new WalletConnectConnector({
  rpc: { 1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID" }, // Replace with your Infura ID
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

const coinbaseWallet = new CoinbaseWallet({
  appName: "Asset Tokenization Dashboard",
  url: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Replace with your Infura ID
});

// Check available Ethereum providers
const getEthereumProvider = () => {
  if (typeof window !== "undefined") {
    if (window.ethereum?.isMetaMask) return { provider: window.ethereum, type: "metamask" };
    if (window.ethereum?.isCoinbaseWallet) return { provider: window.ethereum, type: "coinbase" };
    return null;
  }
  return null;
};

// Reusable Button Component
const Button = ({ variant, className, children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`rounded-md px-4 py-2 font-medium transition-colors ${
      variant === "default"
        ? "bg-black text-white hover:bg-gray-900"
        : "border border-gray-300 bg-white text-black hover:bg-gray-50"
    } ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

// Reusable Card Component
const Card = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

// Asset Registration Form
const AssetRegistrationForm = ({ signer }) => {
  const [assetDetails, setAssetDetails] = useState({
    name: "",
    description: "",
    type: "property",
    governmentId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Asset registered successfully!");
    console.log("Asset Details:", assetDetails);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Register Asset</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Asset Name"
          value={assetDetails.name}
          onChange={(e) =>
            setAssetDetails({ ...assetDetails, name: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <textarea
          placeholder="Asset Description"
          value={assetDetails.description}
          onChange={(e) =>
            setAssetDetails({ ...assetDetails, description: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <select
          value={assetDetails.type}
          onChange={(e) =>
            setAssetDetails({ ...assetDetails, type: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="property">Property</option>
          <option value="vehicle">Vehicle</option>
        </select>
        <input
          type="text"
          placeholder="Government ID"
          value={assetDetails.governmentId}
          onChange={(e) =>
            setAssetDetails({ ...assetDetails, governmentId: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <Button type="submit" variant="default">
          Register Asset
        </Button>
      </form>
    </Card>
  );
};

// Ownership Verification
const OwnershipVerification = ({ signer }) => {
  const [verificationResult, setVerificationResult] = useState("");

  const verifyOwnership = async () => {
    setVerificationResult("Ownership verified successfully!");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Ownership Verification</h2>
      <Button variant="default" onClick={verifyOwnership}>
        Verify Ownership
      </Button>
      {verificationResult && (
        <p className="mt-4 text-green-600">{verificationResult}</p>
      )}
    </Card>
  );
};

// Escrow & Payments
const EscrowPayments = ({ signer }) => {
  const [escrowDetails, setEscrowDetails] = useState({
    amount: "",
    recipient: "",
  });

  const handleEscrowSubmit = async (e) => {
    e.preventDefault();
    alert("Escrow created successfully!");
    console.log("Escrow Details:", escrowDetails);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Escrow & Payments</h2>
      <form onSubmit={handleEscrowSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Recipient Address"
          value={escrowDetails.recipient}
          onChange={(e) =>
            setEscrowDetails({ ...escrowDetails, recipient: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Amount (ETH)"
          value={escrowDetails.amount}
          onChange={(e) =>
            setEscrowDetails({ ...escrowDetails, amount: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <Button type="submit" variant="default">
          Create Escrow
        </Button>
      </form>
    </Card>
  );
};

// Main Dashboard Component
export default function AssetTokenizationDashboard() {
  const [activeTab, setActiveTab] = useState("assets");
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect to specific wallet
  const connectWallet = useCallback(async (type) => {
    try {
      setIsConnecting(true);
      let web3Provider, signerInstance, address;

      switch (type) {
        case "metamask": {
          const ethProvider = getEthereumProvider();
          if (!ethProvider || !ethProvider.provider.isMetaMask) {
            throw new Error("MetaMask not detected");
          }
          const accounts = await ethProvider.provider.request({
            method: "eth_requestAccounts",
          });
          web3Provider = new ethers.BrowserProvider(ethProvider.provider);
          signerInstance = await web3Provider.getSigner();
          address = accounts[0];
          break;
        }
        case "coinbase": {
          const ethProvider = getEthereumProvider();
          if (!ethProvider || !ethProvider.provider.isCoinbaseWallet) {
            await coinbaseWallet.activate();
            web3Provider = new ethers.BrowserProvider(coinbaseWallet.provider);
            signerInstance = await web3Provider.getSigner();
            address = await signerInstance.getAddress();
          } else {
            const accounts = await ethProvider.provider.request({
              method: "eth_requestAccounts",
            });
            web3Provider = new ethers.BrowserProvider(ethProvider.provider);
            signerInstance = await web3Provider.getSigner();
            address = accounts[0];
          }
          break;
        }
        case "walletconnect": {
          await walletConnect.activate();
          web3Provider = new ethers.BrowserProvider(walletConnect.provider);
          signerInstance = await web3Provider.getSigner();
          address = await signerInstance.getAddress();
          break;
        }
        default:
          throw new Error("Unsupported wallet type");
      }

      setProvider(web3Provider);
      setSigner(signerInstance);
      setWalletAddress(address);
      setWalletType(type);
    } catch (error) {
      console.error(`Failed to connect ${type} wallet:`, error);
      alert(`Failed to connect ${type} wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      if (walletType === "walletconnect") {
        await walletConnect.deactivate();
      } else if (walletType === "coinbase" && !window.ethereum?.isCoinbaseWallet) {
        await coinbaseWallet.deactivate();
      }
      setProvider(null);
      setSigner(null);
      setWalletAddress("");
      setWalletType(null);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, [walletType]);

  // Check existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      const ethProvider = getEthereumProvider();
      if (ethProvider) {
        try {
          const web3Provider = new ethers.BrowserProvider(ethProvider.provider);
          const accounts = await web3Provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            const signerInstance = await web3Provider.getSigner();
            setProvider(web3Provider);
            setSigner(signerInstance);
            setWalletAddress(accounts[0]);
            setWalletType(ethProvider.type);
          }
        } catch (error) {
          console.error("Check connection error:", error);
        }
      }
    };
    checkExistingConnection();
  }, []);

  // Handle account changes
  useEffect(() => {
    const ethProvider = getEthereumProvider();
    if (!ethProvider?.provider) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        await disconnectWallet();
      } else {
        const web3Provider = new ethers.BrowserProvider(ethProvider.provider);
        const signerInstance = await web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(signerInstance);
        setWalletAddress(accounts[0]);
      }
    };

    ethProvider.provider.on("accountsChanged", handleAccountsChanged);
    return () => {
      ethProvider.provider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [disconnectWallet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm rounded-2xl mb-6 border border-gray-100"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Asset Tokenization Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {walletAddress ? (
              <>
                <Button
                  variant="default"
                  className="rounded-full px-6 space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  className="rounded-full px-6 space-x-2"
                  onClick={() => connectWallet("metamask")}
                  disabled={isConnecting}
                >
                  <Wallet className="w-4 h-4" />
                  <span>MetaMask</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 space-x-2"
                  onClick={() => connectWallet("coinbase")}
                  disabled={isConnecting}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Coinbase</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 space-x-2"
                  onClick={() => connectWallet("walletconnect")}
                  disabled={isConnecting}
                >
                  <Wallet className="w-4 h-4" />
                  <span>WalletConnect</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <Card className="p-2">
          <nav className="space-y-1">
            {[
              { id: "assets", icon: Home, label: "My Assets" },
              { id: "mint", icon: Plus, label: "Create Asset" },
              { id: "verify", icon: Shield, label: "Ownership Verification" },
              { id: "transactions", icon: RefreshCw, label: "Activity" },
              { id: "escrow", icon: CreditCard, label: "Escrow & Payments" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <motion.div whileHover={{ scale: 1.02 }} key={item.id}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start rounded-xl px-4 py-3 text-sm ${
                    activeTab === item.id ? "shadow-md" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </nav>
        </Card>

        <div className="col-span-3">
          {activeTab === "mint" && <AssetRegistrationForm signer={signer} />}
          {activeTab === "verify" && <OwnershipVerification signer={signer} />}
          {activeTab === "escrow" && <EscrowPayments signer={signer} />}
          {activeTab === "assets" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">My Assets</h2>
              <p>Connect a wallet to view your assets.</p>
            </Card>
          )}
          {activeTab === "transactions" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Activity</h2>
              <p>Connect a wallet to view your transaction history.</p>
            </Card>
          )}
          {activeTab === "settings" && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p>Settings will be available soon.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}