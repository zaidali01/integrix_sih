// Minimal hand-drawn line-icon set — replaces lucide-react entirely.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconShield = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 3L20 6V11C20 16 16.5 20 12 21C7.5 20 4 16 4 11V6L12 3Z" />
    </svg>
);

export const IconFingerprint = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 4C7 4 4 7.5 4 12" />
        <path d="M12 4C17 4 20 7.5 20 12C20 15 19 17.5 17.5 19.5" />
        <path d="M8 12C8 9 9.5 7 12 7C14.5 7 16 9 16 12V15" />
        <path d="M12 10V16C12 18 13 19.5 14.5 20.5" />
        <path d="M8 12V14C8 17 9.5 19 12 20" />
    </svg>
);

export const IconVault = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <rect x="3.5" y="4" width="17" height="16" rx="1" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 9V7M12 17V15M9 12H7M17 12H15" />
    </svg>
);

export const IconUsers = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20C3 16.5 5.5 14 9 14C12.5 14 15 16.5 15 20" />
        <path d="M16 8.5C17.2 8.2 18 7.2 18 6C18 4.6 16.9 3.5 15.5 3.5" />
        <path d="M15 14.2C17.8 14.7 20 17 20 20" />
    </svg>
);

export const IconActivity = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M3 12H7L9.5 5L14 19L16.5 12H21" />
    </svg>
);

export const IconMenu = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M4 6H20M4 12H20M4 18H20" />
    </svg>
);

export const IconX = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M6 6L18 18M18 6L6 18" />
    </svg>
);

export const IconCheck = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M4 12L9.5 17.5L20 6" />
    </svg>
);

export const IconAlert = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 3L21.5 20H2.5L12 3Z" />
        <path d="M12 10V14.5" />
        <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
);

export const IconInfo = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11V16" />
        <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
);

export const IconUpload = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 15V4M12 4L7 9M12 4L17 9" />
        <path d="M4 16V18C4 19 4.5 20 6 20H18C19.5 20 20 19 20 18V16" />
    </svg>
);

export const IconSearch = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M19 19L15.3 15.3" />
    </svg>
);

export const IconLock = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <rect x="5" y="10" width="14" height="10" rx="1" />
        <path d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10" />
    </svg>
);

export const IconFile = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
        <path d="M6 3H14L18 7V21H6V3Z" />
        <path d="M14 3V7H18" />
    </svg>
);

export const IconLoader = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} {...base}>
        <path d="M12 3V6M12 18V21M4.2 4.2L6.3 6.3M17.7 17.7L19.8 19.8M3 12H6M18 12H21M4.2 19.8L6.3 17.7M17.7 6.3L19.8 4.2" />
    </svg>
);