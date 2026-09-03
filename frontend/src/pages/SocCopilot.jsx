import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldAlert, List, ExternalLink } from 'lucide-react';

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  time: `14:${i.toString().padStart(2, '0')}`,
  score: Math.floor(Math.random() * 20),
}));

export default function SocCopilot() {
  const [data, setData] = useState(mockData);
  const [onchainLogs, setOnchainLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "HONEYPOT_TRIGGERED", user: "0x4a9...b112", time: "14:15:22", desc: "Attempted to read decoy_asset_1" },
    { id: 2, type: "ANOMALY_VOLUME_HIGH", user: "0x9f1...c299", time: "14:10:05", desc: "45 requests in 60s window" },
  ]);

  useEffect(() => {
    // Simulate real-time ML scoring feed
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        // Occasional spike
        const isSpike = Math.random() > 0.9;
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          score: isSpike ? Math.floor(Math.random() * 60 + 40) : Math.floor(Math.random() * 20)
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch on-chain logs from the backend
    const fetchLogs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/assets/onchain-logs`);
        if (res.ok) {
          const logs = await res.json();
          setOnchainLogs(logs);
        }
      } catch (err) {
        console.error("Failed to fetch on-chain logs", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-cyan-400" size={32} />
            SOC Copilot
          </h1>
          <p className="text-gray-400 mt-1">Real-time UEBA ML Anomaly Feed & Explainable Denials</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-green-400"></div> Normal (0-40)
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div> Watch (41-80)
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> High Risk (&gt;80)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 h-[400px]">
          <h2 className="text-lg font-semibold mb-6">Network Anomaly Score (Isolation Forest)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} />
              <YAxis stroke="#ffffff50" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#030712', borderColor: '#ffffff20', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              Active Alerts Feed
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[400px]">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 relative">
                <div className="absolute top-4 right-4 text-xs text-red-300">{alert.time}</div>
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-red-400 mt-0.5" size={18} />
                  <div>
                    <h3 className="font-semibold text-red-200">{alert.type}</h3>
                    <p className="text-sm text-red-300/80 mt-1">{alert.desc}</p>
                    <div className="text-xs font-mono text-red-400/60 mt-2">User: {alert.user}</div>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium rounded-lg transition-colors">
                  Revoke Badges (Human Review)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* On-Chain Audit Log Section */}
      <div className="glass-card p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <List className="text-purple-400" />
            Immutable On-Chain Audit Log (Etherscan/Sepolia)
          </h2>
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Sync
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 font-medium text-gray-400">Event Type</th>
                <th className="p-4 font-medium text-gray-400">Description</th>
                <th className="p-4 font-medium text-gray-400">Block</th>
                <th className="p-4 font-medium text-gray-400 text-right">Etherscan Tx</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">Querying Sepolia network logs...</td>
                </tr>
              ) : onchainLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No recent on-chain events found.</td>
                </tr>
              ) : (
                onchainLogs.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-300 font-mono truncate max-w-md" title={log.desc}>{log.desc}</td>
                    <td className="p-4 text-sm text-gray-400">#{log.blockNumber}</td>
                    <td className="p-4 text-right">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${log.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                      >
                        View <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
