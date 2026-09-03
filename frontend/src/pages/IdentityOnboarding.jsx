import React, { useState } from 'react';
import { ethers } from 'ethers';
import Frame from '../components/Frame';
import Eyebrow from '../components/Eyebrow';
import { IconFingerprint, IconLoader, IconCheck } from '../components/icons';
import { useToast } from '../components/Toast';

export default function IdentityOnboarding() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not detected. Please install it to continue.');
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const did = `did:ethr:${userAddress}`;

      const challengeRes = await fetch(`${API_URL}/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ did }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challengeData.error || 'Failed to get challenge');

      setStatus('signed');
      const signature = await signer.signMessage(challengeData.nonce);

      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ did, signature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

      setStatus('minted');
      toast.success(verifyData.minted ? 'Identity NFT minted and verified.' : 'Identity re-verified.');
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Identity verification failed');
      setStatus('idle');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Masthead */}
      <div className="mb-12 pb-8 border-b border-border">
        <Eyebrow>SIH26125 · Blockchain & Cybersecurity</Eyebrow>
        <h1 className="text-[15vw] sm:text-8xl md:text-9xl font-display font-black uppercase tracking-tight leading-[0.82] -ml-1">
          ArgusChain
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6">
          <Eyebrow>01 — Identity Layer</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 leading-tight">
            Establish your identity
          </h2>
          <p className="text-muted leading-relaxed max-w-md">
            A cryptographically signed challenge binds your Ethereum address to a
            non-transferable identity token. No credentials to steal, no password
            database to breach.
          </p>
        </div>

        <div className="lg:col-span-6">
          <Frame label="Onboarding" className="p-8">
            <div className="flex flex-col items-start">
              <div className="w-14 h-14 border border-border flex items-center justify-center mb-6">
                {status === 'idle' && <IconFingerprint size={24} className="text-muted" />}
                {status === 'signed' && <IconLoader size={22} className="text-accent" />}
                {status === 'minted' && <IconCheck size={24} className="text-success" />}
              </div>

              <h3 className="text-lg font-display font-bold mb-2">
                {status === 'idle' && "Connect wallet"}
                {status === 'signed' && "Verifying signature"}
                {status === 'minted' && "Identity verified"}
              </h3>

              <p className="text-sm text-muted mb-8 leading-relaxed">
                {status === 'idle' && "Connect your Ethereum wallet to begin the authentication challenge."}
                {status === 'signed' && "Confirm the signature request in your wallet."}
                {status === 'minted' && (
                  <span className="font-mono text-xs break-all">
                    Bound to {address.substring(0, 8)}...{address.substring(36)}
                  </span>
                )}
              </p>

              {status !== 'minted' && (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? <IconLoader size={16} /> : "Connect & sign challenge"}
                </button>
              )}

              {status === 'minted' && (
                <div className="w-full p-3 border border-success/30 bg-success/10 flex items-center justify-center gap-2 text-success text-sm font-medium">
                  <IconCheck size={16} /> Identity secure
                </div>
              )}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}