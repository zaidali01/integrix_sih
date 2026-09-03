export default function Eyebrow({ children }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="w-4 h-px bg-accent shrink-0"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{children}</span>
        </div>
    );
}