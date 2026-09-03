export default function Frame({ children, className = '', label }) {
    return (
        <div className={`relative border border-border bg-panel ${className}`}>
            <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-paper/30 pointer-events-none"></span>
            <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t border-r border-paper/30 pointer-events-none"></span>
            <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-b border-l border-paper/30 pointer-events-none"></span>
            <span className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r border-paper/30 pointer-events-none"></span>
            {label && (
                <div className="absolute -top-2.5 left-4 bg-ink px-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                    {label}
                </div>
            )}
            {children}
        </div>
    );
}