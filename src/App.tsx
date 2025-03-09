import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Dashboard from "./Dashboard";

// UI Components
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

const Card = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

// Animated Heart Icon
const HeartIcon = () => (
  <motion.svg
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-6 w-6 mr-2"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </motion.svg>
);

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black text-white shadow-lg sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <HeartIcon />
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg md:text-xl font-bold"
            >
              Asset Tokenization
            </motion.h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="#home" className="hover:underline">
              Home
            </a>
            <a href="#about" className="hover:underline">
              About
            </a>
            <a href="#contact" className="hover:underline">
              Contact
            </a>
            <div className="flex space-x-4">
              <a href="/dashboard">
                <Button variant="default" className="px-6">
                  Go to Dashboard
                </Button>
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div
            ref={menuRef}
            className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <div className="flex items-center">
                <HeartIcon />
                <h1 className="text-lg font-bold">Asset Tokenization</h1>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <a href="#home" className="block py-2 hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="block py-2 hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#contact" className="block py-2 hover:underline">
                    Contact
                  </a>
                </li>
                <li className="mt-4">
                  <a href="/dashboard" className="w-full">
                    <Button variant="default" className="w-full">
                      Go to Dashboard
                    </Button>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center flex-grow py-16 px-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
          Smart Contracts for Real Assets
        </h1>
        <p className="text-lg md:text-xl text-center text-gray-600 mb-8 max-w-2xl">
          Transforming physical assets into secure digital tokens through
          blockchain technology.
        </p>
        <div className="flex gap-4 flex-col md:flex-row">
          <Button variant="default">Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Step 1: Create an Account
              </h3>
              <p className="text-gray-600">
                Sign up using your email or connect a Web3 wallet like MetaMask.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Step 2: Upload Asset Details
              </h3>
              <p className="text-gray-600">
                Provide information about the physical asset you want to
                tokenize.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Step 3: Mint NFTs</h3>
              <p className="text-gray-600">
                Our platform creates an NFT for your asset, securely storing its
                metadata on the blockchain.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Purpose of the Website
          </h2>
          <p className="text-lg md:text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Our platform leverages blockchain technology to tokenize real-world
            assets, enabling secure and transparent ownership transfers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Tokenization</h3>
              <p className="text-gray-600">
                Convert physical assets like real estate, art, and collectibles
                into digital tokens.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Security</h3>
              <p className="text-gray-600">
                Blockchain ensures tamper-proof records and verifiable
                ownership.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Efficiency</h3>
              <p className="text-gray-600">
                Streamline asset management and reduce intermediaries.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">What is an NFT?</h3>
              <p className="text-gray-600">
                An NFT (non-fungible token) is a unique digital asset that
                represents ownership of a physical or digital item.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                How do I tokenize an asset?
              </h3>
              <p className="text-gray-600">
                Upload your asset details, and our platform will mint an NFT for
                you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white mt-8">
        <div className="container mx-auto px-4 py-6 text-center">
          <p>&copy; 2025 All rights reserved.</p>
          <div className="mt-2">
            <a
              href="#privacy-policy"
              className="text-sm text-gray-400 hover:underline mr-4"
            >
              Privacy Policy
            </a>
            <a
              href="#terms-of-service"
              className="text-sm text-gray-400 hover:underline mr-4"
            >
              Terms of Service
            </a>
            <a href="#faqs" className="text-sm text-gray-400 hover:underline">
              FAQs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}