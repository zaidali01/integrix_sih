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

        <div className="glass-card p-6 opacity-50 cursor-not-allowed">
          <h2 className="text-xl font-semibold mb-6">Batch Issue Access Badges</h2>
          <p className="text-gray-400 mb-4">Select an Asset ID and upload a CSV of allowed wallet addresses to mint ERC-1155 access badges in bulk.</p>
          <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
