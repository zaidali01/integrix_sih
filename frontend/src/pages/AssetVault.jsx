import React, { useState } from 'react';
import { UploadCloud, FileText, Lock, FileKey } from 'lucide-react';

export default function AssetVault() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);

  const fileInputRef = React.useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  React.useEffect(() => {
    fetch(`${API_URL}/assets`)
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error("Failed to load assets:", err));
  }, [API_URL]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/assets/upload`, {
        method: 'POST',
        headers: { 'x-user-address': '0xHackathonDemoAddress123' },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.asset) {
        setAssets(prev => [data.asset, ...prev]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error: Is the Node.js backend running on port 3000?");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Vault</h1>
          <p className="text-gray-400 mt-1">Secure, encrypted off-chain storage with on-chain SHA-256 validation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 font-medium text-gray-400">File Name</th>
                <th className="p-4 font-medium text-gray-400">SHA-256 (On-Chain)</th>
                <th className="p-4 font-medium text-gray-400">Date Uploaded</th>
                <th className="p-4 font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4 flex items-center gap-3">
                    <FileText className="text-cyan-400" size={20} />
                    <span className="font-medium">{asset.name}</span>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-500">{asset.hash}</td>
                  <td className="p-4 text-sm text-gray-400">{asset.date}</td>
                  <td className="p-4">
                    <button className="px-4 py-1.5 rounded-lg bg-white/10 text-sm hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2">
                      <Lock size={14} /> Request Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UploadCloud className="text-purple-400" />
            Upload New Asset
          </h2>
          
          <div 
            onClick={handleUploadClick}
            className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-black/20 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <FileKey size={48} className="text-gray-500 group-hover:text-cyan-400 transition-colors mb-4" />
            <p className="text-gray-300 font-medium mb-1">Drag & Drop or Click</p>
            <p className="text-sm text-gray-500 mb-6">Files are AES-256 encrypted locally before the hash is minted on-chain.</p>
            
            <button 
              disabled={uploading}
              className="glow-button w-full"
            >
              {uploading ? 'Encrypting & Minting...' : 'Select File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
