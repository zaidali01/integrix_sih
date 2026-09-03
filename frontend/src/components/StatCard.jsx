export default function StatCard({ label, value, sub }) {
    return (
        <div className="border border-border bg-panel px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">{label}</div>
            <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-serif font-semibold text-2xl sm:text-3xl text-paper">{value}</span>
                {sub && <span className="text-xs text-muted font-mono">{sub}</span>}
            </div>
        </div>
    );
}