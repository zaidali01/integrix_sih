import React, { useState } from 'react';
import { ethers } from 'ethers';
import Frame from '../components/Frame';
import Eyebrow from '../components/Eyebrow';
import StatCard from '../components/StatCard';
import { IconUpload, IconFile, IconLock, IconLoader, IconVault } from '../components/icons';
import { useToast } from '../components/Toast';

export default function AssetVault() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [requestingId, setRequestingId] = useState(null);
  const fileInputRef = React.useRef(null);
  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  React.useEffect(() => {
    fetch(`${API_URL}/assets`)
      .then((res) => res.json())
      .then((data) => {
        // Backend's `id` field IS the on-chain assetId — normalize so
        // Request Access works the same whether an asset came from this
        // fetch or from a fresh upload in this session.
        const normalized = data.map((a) => ({ ...a, assetId: a.assetId ?? a.id }));
        setAssets(normalized);
      })
      .catch((err) => console.error('Failed to load assets:', err));
  }, [API_URL]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleRequestAccess = async (assetId) => {
    if (assetId === undefined || assetId === null) {
      toast.error('This asset has no on-chain ID.');
      return;
    }
    if (!window.ethereum) {
      toast.error('MetaMask not detected.');
      return;
    }
    setRequestingId(assetId);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const res = await fetch(`${API_URL}/assets/${assetId}/access-request`, {
        method: 'POST',
        headers: { 'x-user-address': userAddress },
      });
      const data = await res.json();

      if (res.ok && data.status === 'granted') {
        toast.success(data.message || 'Access granted.');
      } else {
        toast.error(`Denied: ${data.reason || data.error || 'Unknown reason'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Access request failed');
    } finally {
      setRequestingId(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.ethereum) {
      toast.error('MetaMask not detected.');
      return;
    }

    setUploading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/assets/upload`, {
        method: 'POST',
        headers: { 'x-user-address': userAddress },
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.hash) {
        setAssets((prev) => [
          {
            id: prev.length + 1,
            assetId: data.assetId,
            name: file.name,
            hash: "0x" + data.hash.slice(0, 8) + "..." + data.hash.slice(-4),
            date: new Date().toISOString().split('T')[0],
            txHash: data.txHash,
          },
          ...prev,
        ]);
        toast.success('Asset encrypted, stored, and minted on-chain.');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Is the backend running on port 3000?');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <Eyebrow>03 — Asset Layer</Eyebrow>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Asset vault</h1>
        <p className="text-muted text-sm leading-relaxed">
          Files are hashed and AES-256 encrypted before storage. Only the SHA-256
          digest and ownership record are written on-chain.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Assets in vault" value={assets.length} />
        <StatCard label="Encryption" value="AES-256" sub="CBC · per-file IV" />
        <StatCard label="Storage" value="MinIO" sub="local S3-compatible" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Frame label={`${assets.length} Asset${assets.length !== 1 ? 's' : ''}`} className="lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-muted font-medium">File</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-muted font-medium">Asset ID</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-muted font-medium">SHA-256</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-muted font-medium">Date</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-wider text-muted font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <IconVault size={28} className="text-muted mx-auto mb-3" />
                      <p className="text-muted text-sm">No assets uploaded yet.</p>
                    </td>
                  </tr>
                )}
                {assets.map(asset => (
                  <tr key={asset.id} className="border-b border-border hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <IconFile className="text-accent shrink-0" size={16} />
                      <span className="font-medium text-sm truncate max-w-[160px]">{asset.name}</span>
                    </td>
                    <td className="p-4 text-sm font-mono text-accent">{asset.assetId ?? '—'}</td>
                    <td className="p-4 text-sm font-mono text-muted">{asset.hash}</td>
                    <td className="p-4 text-sm font-mono text-muted">{asset.date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleRequestAccess(asset.assetId)}
                        disabled={requestingId === asset.assetId}
                        className="px-3 py-1.5 border border-border hover:border-accent hover:text-accent text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {requestingId === asset.assetId ? <IconLoader size={13} /> : <IconLock size={13} />}
                        Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Frame>

        <Frame label="Upload" className="p-6 flex flex-col">
          <h2 className="text-lg font-display font-medium mb-6 flex items-center gap-2">
            <IconUpload className="text-accent" size={18} />
            Upload new asset
          </h2>

          <div
            onClick={handleUploadClick}
            className="flex-1 border border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors min-h-[220px]"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <IconFile size={32} className="text-muted mb-4" />
            <p className="text-sm font-medium mb-1">Drag & drop or click</p>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              Files are AES-256 encrypted locally before the hash is minted on-chain.
            </p>
            <button disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
              {uploading ? <><IconLoader size={16} /> Encrypting...</> : 'Select file'}
            </button>
          </div>
        </Frame>
      </div>
    </div>
  );
}