// components/PlaidLinkButton.tsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess, PlaidLinkOnExit } from 'react-plaid-link';
import { DataContext } from '../context/DataContext';

interface PlaidLinkButtonProps {
    onSuccess?: (publicToken: string, metadata: any) => void;
    isPrimaryAction?: boolean;
}

/**
 * @description The Sovereign's connection to Plaid. This component handles
 * both the initial "Link Account" action and the specialized "receivedRedirectUri"
 * required for OAuth completion after a user is redirected from their bank.
 */
const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccess: parentOnSuccess, isPrimaryAction = false }) => {
    const context = useContext(DataContext);
    const [token, setToken] = useState<string | null>(null);

    if (!context) throw new Error("PlaidLinkButton must be within a DataProvider");
    const { fetchLinkToken, handlePlaidSuccess } = context;

    // DETECT OAUTH REDIRECT: We look for the presence of the state ID in the URL.
    const oauthStateId = new URLSearchParams(window.location.search).get('oauth_state_id');

    const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token, metadata) => {
        handlePlaidSuccess(public_token, metadata);
        if (parentOnSuccess) parentOnSuccess(public_token, metadata);
    }, [handlePlaidSuccess, parentOnSuccess]);

    const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
        if (error) console.error("Plaid Link Exit Error:", error);
        localStorage.removeItem('link_token');
    }, []);

    const config: PlaidLinkOptions = {
        token: token!,
        onSuccess,
        onExit,
    };

    if (oauthStateId) {
        config.receivedRedirectUri = window.location.href;
    }

    const { open, ready, error: linkError } = usePlaidLink(config);

    // Initial Handshake Logic
    useEffect(() => {
        const initializeLink = async () => {
            const storedToken = localStorage.getItem('link_token');
            if (oauthStateId && storedToken) {
                setToken(storedToken);
            } else if (!token) {
                const newToken = await fetchLinkToken();
                if (newToken) setToken(newToken);
            }
        };
        initializeLink();
    }, [fetchLinkToken, oauthStateId, token]);

    // Auto-Open for OAuth
    useEffect(() => {
        if (oauthStateId && ready && open) {
            open();
        }
    }, [ready, open, oauthStateId]);

    if (linkError) return null;

    // Headless redirect state
    if (oauthStateId) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/50 rounded-xl border border-cyan-500/30 animate-pulse">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-cyan-300 font-mono text-xs uppercase tracking-widest">Resuming Secure Handshake...</p>
            </div>
        );
    }

    return (
        <button 
            onClick={() => open()}
            disabled={!ready}
            className={`group relative w-full flex justify-center items-center py-4 px-6 border rounded-xl shadow-xl text-sm font-bold text-white transition-all duration-300 overflow-hidden ${isPrimaryAction ? 'bg-cyan-600 border-cyan-500 hover:bg-cyan-500' : 'bg-black border-gray-700 hover:border-cyan-500/50'}`}
        >
             <div className="absolute inset-0 bg-white/5 skew-x-[-20deg] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
            <div className="mr-3 transform group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 11l-4 4-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="relative tracking-widest uppercase">{isPrimaryAction ? 'Finalize Account Link' : 'Establish Data Treaty'}</span>
        </button>
    );
};

export default PlaidLinkButton;