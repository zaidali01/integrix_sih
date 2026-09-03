import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Frame from '../components/Frame';
import Eyebrow from '../components/Eyebrow';
import { IconActivity, IconAlert } from '../components/icons';

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  time: `14:${i.toString().padStart(2, '0')}`,
  score: Math.floor(Math.random() * 20),
}));

export default function SocCopilot() {
  const [data, setData] = useState(mockData);
  const [alerts] = useState([
    { id: 1, type: "HONEYPOT_TRIGGERED", user: "0x4a9...b112", time: "14:15:22", desc: "Attempted to read decoy_asset_1" },
    { id: 2, type: "ANOMALY_VOLUME_HIGH", user: "0x9f1...c299", time: "14:10:05", desc: "45 requests in 60s window" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const isSpike = Math.random() > 0.9;
        next.push({
          time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
          score: isSpike ? Math.floor(Math.random() * 60 + 40) : Math.floor(Math.random() * 20),
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div className="max-w-xl">
          <Eyebrow>04 — Behavioral Layer</Eyebrow>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <IconActivity className="text-accent" size={28} />
            SOC copilot
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Behavioral anomaly scoring and explainable denials. This layer detects
            and explains — it never enforces access on its own.
          </p>
        </div>
        <div className="border border-accent/30 px-3 py-1.5 flex items-center gap-2 text-accent shrink-0 self-start font-mono text-xs uppercase tracking-wider">
          Simulated feed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Frame label="Anomaly Score" className="lg:col-span-2 p-6 h-[380px]">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted mb-6">Request risk score, rolling window</h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C89B3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(28,26,22,0.08)" vertical={false} />
              <XAxis dataKey="time" stroke="#847E70" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#847E70" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FBF9F3', borderColor: 'rgba(28,26,22,0.12)', borderRadius: '0px', fontFamily: 'IBM Plex Mono' }}
                itemStyle={{ color: '#C89B3C' }}
                labelStyle={{ color: '#847E70' }}
              />
              <Area type="monotone" dataKey="score" stroke="#C89B3C" strokeWidth={1.5} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </Frame>

        <Frame label="Alerts" className="flex flex-col">
          <div className="p-5 border-b border-border">
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted flex items-center gap-2">
              <IconAlert size={14} className="text-accent" />
              Active alerts
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[300px]">
            {alerts.map(alert => (
              <div key={alert.id} className="p-3 border border-danger/30 bg-danger/[0.05] relative">
                <div className="absolute top-3 right-3 text-[10px] font-mono text-danger/70">{alert.time}</div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-danger mb-1">{alert.type}</h3>
                <p className="text-xs text-muted mb-2 leading-relaxed">{alert.desc}</p>
                <div className="text-[10px] font-mono text-muted/70">User: {alert.user}</div>
              </div>
            ))}
          </div>
        </Frame>
      </div>
    </div>
  );
}