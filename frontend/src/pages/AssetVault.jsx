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
      const userAddress = localStorage.getItem('walletAddress');
      if (!userAddress) {
        alert("Please connect your wallet on the Identity page first!");
        setUploading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/assets/upload`, {
        method: 'POST',
        headers: { 'x-user-address': userAddress },
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

      <div className="flex flex-col gap-8">
        {/* Table Section */}
        <div className="glass-card w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
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
                  <td className="p-4 flex items-center gap-3 max-w-[200px] lg:max-w-[300px]">
                    <FileText className="text-cyan-400 shrink-0" size={20} />
                    <span className="font-medium truncate block w-full" title={asset.name}>{asset.name}</span>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-500">{asset.hash}</td>
                  <td className="p-4 text-sm text-gray-400">{asset.date}</td>
                  <td className="p-4">
                    <button 
                      onClick={async () => {
                        try {
                          alert(`Initiating Zero-Trust evaluation for ${asset.name}...`);
                          const userAddress = localStorage.getItem('walletAddress');
                          if (!userAddress) {
                            alert("Please connect your wallet first!");
                            return;
                          }

                          const response = await fetch(`${API_URL}/assets/${asset.id}/access-request`, {
                            method: 'POST',
                            headers: { 'x-user-address': userAddress }
                          });
                          const result = await response.json();
                          if (result.status === "granted") {
                            alert(`✅ ACCESS GRANTED\n\nUEBA ML Check Passed.\nMessage: ${result.message}`);
                            if (result.fileBase64) {
                              const link = document.createElement("a");
                              link.href = `data:application/octet-stream;base64,${result.fileBase64}`;
                              link.download = asset.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          } else {
                            alert(`❌ ACCESS DENIED\n\nSecurity Protocol Triggered.\nReason: ${result.reason}`);
                          }
                        } catch(err) {
                          alert("Error contacting security protocol.");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-sm hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Lock size={14} /> Request Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload Section */}
        <div className="glass-card p-8 flex flex-col w-full max-w-2xl mx-auto mt-4">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 justify-center">
            <UploadCloud className="text-purple-400" />
            Upload New Asset
          </h2>
          
          <div 
            onClick={handleUploadClick}
            className="w-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-black/20 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <FileKey size={56} className="text-gray-500 group-hover:text-cyan-400 transition-colors mb-4" />
            <p className="text-gray-300 font-medium mb-2 text-lg">Drag & Drop or Click to Browse</p>
            <p className="text-sm text-gray-500 mb-8 max-w-sm">Files are securely AES-256 encrypted in memory before the hash is minted on-chain to the Sepolia testnet.</p>
            
            <button 
              disabled={uploading}
              className="glow-button w-full max-w-xs"
            >
              {uploading ? 'Encrypting & Minting...' : 'Select File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
