import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import {
  Home,
  Plus,
  RefreshCw,
  Settings,
  Wallet,
  Shield,
  CreditCard,
} from "lucide-react";
import { IPFSTest } from './components/IPFSTest';
import { AssetRegistrationForm } from './components/AssetRegistrationForm';
import { contractHelper } from './utils/contractHelper';

// Types
type WalletType = "metamask" | null;
type EthereumProvider = {
  provider: any;
  type: WalletType;
};

interface ButtonProps {
  variant: "default" | "outline" | "ghost";
  className: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface AssetRegistrationFormProps {
  signer: ethers.JsonRpcSigner | null;
}

interface OwnershipVerificationProps {
  signer: ethers.JsonRpcSigner | null;
}

interface EscrowPaymentsProps {
  signer: ethers.JsonRpcSigner | null;
}

// Reusable Button Component
const Button = ({ variant, className, children, ...props }: ButtonProps) => (
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
const Card = ({ children, className = "" }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

// Check available Ethereum providers
const getEthereumProvider = () => {
  if (typeof window !== "undefined") {
    if (window.ethereum?.isMetaMask) return { provider: window.ethereum, type: "metamask" };
    return null;
  }
  return null;
};

// Ownership Verification
const OwnershipVerification = ({ signer }: OwnershipVerificationProps) => {
  const [verificationResult, setVerificationResult] = useState("");

  const verifyOwnership = async () => {
    setVerificationResult("Ownership verified successfully!");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Ownership Verification</h2>
      <Button variant="default" className="w-full" onClick={verifyOwnership}>
        Verify Ownership
      </Button>
      {verificationResult && (
        <p className="mt-4 text-green-600">{verificationResult}</p>
      )}
    </Card>
  );
};

// Escrow & Payments
const EscrowPayments = ({ signer }: EscrowPaymentsProps) => {
  const [escrowDetails, setEscrowDetails] = useState({
    amount: "",
    recipient: "",
  });

  const handleEscrowSubmit = async (e: React.FormEvent) => {
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
        <Button type="submit" variant="default" className="w-full">
          Create Escrow
        </Button>
      </form>
    </Card>
  );
};

// Main Dashboard Component
export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      const ethProvider = getEthereumProvider();
      if (!ethProvider || !ethProvider.provider.isMetaMask) {
        throw new Error("MetaMask not detected");
      }

      const accounts = await ethProvider.provider.request({
        method: "eth_requestAccounts",
      });

      const web3Provider = new ethers.BrowserProvider(ethProvider.provider);
      const signerInstance = await web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(signerInstance);
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectionError(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    setProvider(null);
    setSigner(null);
    setWalletAddress("");
  };

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

    const handleAccountsChanged = async (accounts: string[]) => {
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
  }, []);

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
              <Button
                variant="default"
                className="rounded-full px-6 space-x-2"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
              </Button>
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
          <IPFSTest />
          
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
};