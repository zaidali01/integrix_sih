import React, { useState } from 'react';
import { UserPlus, ShieldPlus, Search, CheckCircle } from 'lucide-react';

export default function AdminConsole() {
  const [address, setAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('4');
  const [status, setStatus] = useState(null);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!address) return;
    setStatus('assigning');
    
    // Mock API call to backend /admin/roles/assign
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-gray-400 mt-1">Manage network roles and batch access badges.</p>
        </div>
        <div className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 flex items-center gap-2">
          <ShieldPlus size={18} />
          <span>Role: ADMIN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus className="text-cyan-400" />
            Assign Role Token
          </h2>
          
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">User Ethereum Address</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="0x..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors appearance-none"
              >
                <option value="1">Admin (ID: 1)</option>
                <option value="2">Manager (ID: 2)</option>
                <option value="3">Auditor (ID: 3)</option>
                <option value="4">User (ID: 4)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="glow-button w-full mt-4 flex justify-center items-center gap-2"
              disabled={status === 'assigning'}
            >
              {status === 'assigning' ? 'Assigning on-chain...' : status === 'success' ? <><CheckCircle size={20} /> Assigned</> : 'Mint Role Token'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <ShieldPlus size={24} />
            Revoke Access Badge
          </h2>
          <p className="text-gray-400 mb-4 text-sm">Forcefully burn a user's ERC-1155 Access Badge, instantly cutting off their decryption rights at the blockchain layer.</p>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const addr = e.target.address.value;
            const assetId = e.target.assetId.value;
            if (!addr || !assetId) return;
            const btn = e.target.submitBtn;
            btn.innerText = 'Burning on-chain...';
            btn.disabled = true;

            try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
              await fetch(`${API_URL}/assets/revoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: addr, assetId })
              });
              
              btn.innerText = 'Access Revoked (Token Burned)';
              btn.classList.add('bg-green-500');
              setTimeout(() => {
                btn.innerText = 'Burn Access Badge';
                btn.classList.remove('bg-green-500');
                btn.disabled = false;
                e.target.reset();
              }, 3000);
            } catch (err) {
              alert("Error burning token");
              btn.innerText = 'Burn Access Badge';
              btn.disabled = false;
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target User Address</label>
              <input name="address" type="text" placeholder="0x..." className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Asset ID</label>
              <input name="assetId" type="number" placeholder="e.g. 1" className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500" />
            </div>
            <button name="submitBtn" type="submit" className="w-full mt-4 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-500/50">
              Burn Access Badge
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
