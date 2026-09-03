import React, { useState } from 'react';
import { ethers } from 'ethers';
import Frame from '../components/Frame';
import Eyebrow from '../components/Eyebrow';
import StatCard from '../components/StatCard';
import { IconUsers, IconSearch, IconLoader, IconCheck } from '../components/icons';
import { useToast } from '../components/Toast';

export default function AdminConsole() {
  const [address, setAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('4');
  const [status, setStatus] = useState(null);

  const [badgeAddress, setBadgeAddress] = useState('');
  const [badgeAssetId, setBadgeAssetId] = useState('');
  const [badgeStatus, setBadgeStatus] = useState(null);

  const [roleMintCount, setRoleMintCount] = useState(0);
  const [badgeIssueCount, setBadgeIssueCount] = useState(0);

  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [revokeAddress, setRevokeAddress] = useState('');
  const [revokeAssetId, setRevokeAssetId] = useState('');
  const [revokeStatus, setRevokeStatus] = useState(null);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!address) return;
    setStatus('assigning');

    try {
      fetch(`${API_URL}/assets/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, roleId: Number(selectedRole) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role assignment failed');

      setStatus('success');
      setRoleMintCount((c) => c + 1);
      toast.success(`Role token minted to ${address.slice(0, 8)}...`);
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Role assignment failed');
      setStatus(null);
    }
  };

  const handleIssueBadge = async (e) => {
    e.preventDefault();
    if (!badgeAddress || badgeAssetId === '') return;
    setBadgeStatus('issuing');

    try {
      const res = await fetch(`${API_URL}/admin/badges/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: badgeAddress, assetId: Number(badgeAssetId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Badge issuance failed');

      setBadgeStatus('success');
      setBadgeIssueCount((c) => c + 1);
      toast.success(`Access badge issued for asset #${badgeAssetId}`);
      setTimeout(() => setBadgeStatus(null), 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Badge issuance failed');
      setBadgeStatus(null);
    }
  };

  const handleRevokeBadge = async (e) => {
    e.preventDefault();
    if (!revokeAddress || revokeAssetId === '') return;
    if (!window.ethereum) {
      toast.error('MetaMask not detected.');
      return;
    }
    setRevokeStatus('revoking');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const callerAddress = await signer.getAddress();

      const res = await fetch(`${API_URL}/assets/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': callerAddress,
        },
        body: JSON.stringify({ userId: revokeAddress, assetId: Number(revokeAssetId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Badge revocation failed');

      setRevokeStatus('success');
      toast.success(`Access badge revoked for asset #${revokeAssetId}`);
      setTimeout(() => setRevokeStatus(null), 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Badge revocation failed');
      setRevokeStatus(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="max-w-xl">
          <Eyebrow>02 — Access Layer</Eyebrow>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Admin console</h1>
          <p className="text-muted text-sm leading-relaxed">
            Assign named roles and grant per-asset access badges. Both actions
            are mint operations recorded directly on-chain.
          </p>
        </div>
        <div className="border border-accent/40 px-3 py-1.5 flex items-center gap-2 text-accent shrink-0 self-start">
          <IconUsers size={15} />
          <span className="font-mono text-xs uppercase tracking-wider">Role: Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-10">
        <StatCard label="Roles minted (session)" value={roleMintCount} />
        <StatCard label="Badges issued (session)" value={badgeIssueCount} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Frame label="Role Token" className="p-6">
          <h2 className="text-lg font-display font-bold mb-6">Assign role token</h2>

          <form onSubmit={handleAssign} className="space-y-5">
            <div>
              <label className="label-text">User Ethereum address</label>
              <div className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field pl-10 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Select role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input-field"
              >
                <option value="1">Admin (ID: 1)</option>
                <option value="2">Manager (ID: 2)</option>
                <option value="3">Auditor (ID: 3)</option>
                <option value="4">User (ID: 4)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={status === 'assigning'}
            >
              {status === 'assigning' ? <><IconLoader size={16} /> Minting on-chain...</> :
                status === 'success' ? <><IconCheck size={16} /> Assigned</> :
                  'Mint role token'}
            </button>
          </form>
        </Frame>

        <Frame label="Access Badge" className="p-6">
          <h2 className="text-lg font-display font-bold mb-2">Issue access badge</h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Grant access to a specific asset by its on-chain ID, visible in the
            Asset Vault table after upload.
          </p>

          <form onSubmit={handleIssueBadge} className="space-y-5">
            <div>
              <label className="label-text">User Ethereum address</label>
              <div className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="0x..."
                  value={badgeAddress}
                  onChange={(e) => setBadgeAddress(e.target.value)}
                  className="input-field pl-10 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Asset ID</label>
              <input
                type="number"
                placeholder="0"
                value={badgeAssetId}
                onChange={(e) => setBadgeAssetId(e.target.value)}
                className="input-field font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-secondary w-full flex justify-center items-center gap-2"
              disabled={badgeStatus === 'issuing'}
            >
              {badgeStatus === 'issuing' ? <><IconLoader size={16} /> Issuing on-chain...</> :
                badgeStatus === 'success' ? <><IconCheck size={16} /> Issued</> :
                  'Issue badge'}
            </button>
          </form>
        </Frame>

        <Frame label="Revoke Badge" className="p-6">
          <h2 className="text-lg font-display font-bold mb-2">Revoke access badge</h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Burns the user's ERC-1155 badge on-chain, immediately cutting off
            decryption rights for that asset.
          </p>

          <form onSubmit={handleRevokeBadge} className="space-y-5">
            <div>
              <label className="label-text">Target user address</label>
              <div className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="0x..."
                  value={revokeAddress}
                  onChange={(e) => setRevokeAddress(e.target.value)}
                  className="input-field pl-10 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Asset ID</label>
              <input
                type="number"
                placeholder="0"
                value={revokeAssetId}
                onChange={(e) => setRevokeAssetId(e.target.value)}
                className="input-field font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-secondary w-full flex justify-center items-center gap-2"
              disabled={revokeStatus === 'revoking'}
            >
              {revokeStatus === 'revoking' ? <><IconLoader size={16} /> Revoking on-chain...</> :
                revokeStatus === 'success' ? <><IconCheck size={16} /> Revoked</> :
                  'Revoke badge'}
            </button>
          </form>
        </Frame>
      </div>
    </div>
  );
}