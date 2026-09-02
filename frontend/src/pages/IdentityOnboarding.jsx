import React, { useState } from 'react';
import { Wallet, ShieldCheck, Fingerprint, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

export default function IdentityOnboarding() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, signed, minted

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Simulate wallet connection and signature
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        
        // Mock Challenge signing
        setTimeout(() => {
          setStatus('signed');
          // Mock Minting
          setTimeout(() => {
            setStatus('minted');
            setLoading(false);
          }, 1500);
        }, 1500);
      } else {
        alert("Please install MetaMask!");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          Establish Your Identity
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          ArgusChain uses a cryptographically secure, soulbound NFT to verify your identity across the network. No passwords, just cryptography.
        </p>
      </div>

      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            {status === 'idle' && <Wallet size={40} className="text-gray-300" />}
            {status === 'signed' && <Fingerprint size={40} className="text-cyan-400 animate-pulse" />}
            {status === 'minted' && <ShieldCheck size={40} className="text-green-400" />}
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            {status === 'idle' && "Connect Wallet"}
            {status === 'signed' && "Verifying Signature..."}
            {status === 'minted' && "Identity Verified"}
          </h2>
          
          <p className="text-gray-400 text-center mb-8 h-12">
            {status === 'idle' && "Connect your Ethereum wallet to begin the authentication challenge."}
            {status === 'signed' && "Validating your cryptographic signature against the DID registry."}
            {status === 'minted' && `Soulbound Identity NFT issued to ${address.substring(0, 6)}...${address.substring(38)}`}
          </p>

          {status === 'idle' && (
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="glow-button w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Connect & Sign Challenge"}
            </button>
          )}

          {status === 'minted' && (
            <div className="w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-medium gap-2">
              <ShieldCheck size={20} /> Identity Secure
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
