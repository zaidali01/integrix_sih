import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Shield, Users, FolderLock, Activity, Fingerprint } from 'lucide-react';
import IdentityOnboarding from './pages/IdentityOnboarding';
import AdminConsole from './pages/AdminConsole';
import AssetVault from './pages/AssetVault';
import SocCopilot from './pages/SocCopilot';

function Sidebar() {
  const navItems = [
    { to: "/onboarding", icon: <Fingerprint size={20} />, label: "Identity" },
    { to: "/vault", icon: <FolderLock size={20} />, label: "Asset Vault" },
    { to: "/admin", icon: <Users size={20} />, label: "Admin Console" },
    { to: "/soc", icon: <Activity size={20} />, label: "SOC Copilot" },
  ];

  return (
    <div className="w-64 glass-card m-4 p-6 flex flex-col h-[calc(100vh-32px)] sticky top-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Shield size={28} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
          ArgusChain
        </h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-white/10 text-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] border border-white/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 rounded-xl bg-purple-900/20 border border-purple-500/20">
        <div className="text-xs text-purple-300 mb-1">Network</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-sm font-medium">Sepolia (Live)</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<IdentityOnboarding />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/vault" element={<AssetVault />} />
            <Route path="/soc" element={<SocCopilot />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
