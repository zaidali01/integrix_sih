import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <span className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Error 404</span>
            <h1 className="text-5xl sm:text-6xl font-display font-medium mb-4">Page not found</h1>
            <p className="text-muted max-w-md mb-8">
                The route you're looking for doesn't exist on this network.
            </p>
            <Link to="/onboarding" className="btn-primary">
                Return to Identity
            </Link>
        </div>
    );
}