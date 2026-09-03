import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import IdentityOnboarding from './pages/IdentityOnboarding';
import AdminConsole from './pages/AdminConsole';
import AssetVault from './pages/AssetVault';
import SocCopilot from './pages/SocCopilot';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/Toast';
import { IconShield, IconFingerprint, IconVault, IconUsers, IconActivity, IconMenu, IconX } from './components/icons';

const PAGE_TITLES = {
  '/onboarding': 'Identity — ArgusChain',
  '/vault': 'Asset Vault — ArgusChain',
  '/admin': 'Admin Console — ArgusChain',
  '/soc': 'SOC Copilot — ArgusChain',
};

function useDocumentTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || 'ArgusChain';
  }, [location.pathname]);
}

const navItems = [
  { to: "/onboarding", icon: IconFingerprint, label: "Identity" },
  { to: "/vault", icon: IconVault, label: "Asset Vault" },
  { to: "/admin", icon: IconUsers, label: "Admin Console" },
  { to: "/soc", icon: IconActivity, label: "SOC Copilot" },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-10 px-1">
        <div className="p-2 border border-accent/40 rounded-sm text-accent">
          <IconShield size={22} />
        </div>
        <h1 className="text-xl font-display font-extrabold uppercase tracking-tight text-paper">
          ArgusChain
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors duration-150 text-sm ${isActive
                ? "bg-accentDim text-accent"
                : "text-muted hover:text-paper hover:bg-white/5"
              }`
            }
          >
            <item.icon size={17} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">Network</div>
        <div className="flex items-center gap-2 font-mono text-xs text-paper">
          <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
          <span>Hardhat Local · 31337</span>
        </div>
      </div>
    </>
  );
}

function App() {
  useDocumentTitle();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen grid-bg">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 panel m-4 p-6 flex-col h-[calc(100vh-32px)] sticky top-4 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-ink border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-accent/40 rounded-sm text-accent">
              <IconShield size={18} />
            </div>
            <span className="font-display text-lg font-extrabold uppercase tracking-tight">ArgusChain</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-paper"
            aria-label="Open menu"
          >
            <IconMenu size={22} />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-panel border-r border-border p-6 flex flex-col h-full animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-paper"
                aria-label="Close menu"
              >
                <IconX size={20} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 pt-20 lg:pt-8 sm:p-8 lg:pt-8 overflow-y-auto min-w-0 bg-transparent">
          <div className="max-w-6xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="/onboarding" element={<IdentityOnboarding />} />
              <Route path="/admin" element={<AdminConsole />} />
              <Route path="/vault" element={<AssetVault />} />
              <Route path="/soc" element={<SocCopilot />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;