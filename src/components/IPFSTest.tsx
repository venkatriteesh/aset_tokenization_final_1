import { useState, useEffect } from 'react';
import { validateIPFSConnection } from '../utils/ipfs';

export const IPFSTest = () => {
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const isConnected = await validateIPFSConnection();
            setConnectionStatus(isConnected ? 'connected' : 'failed');
        } catch (error) {
            setConnectionStatus('failed');
            setError(error instanceof Error ? error.message : 'Failed to connect to IPFS');
        }
    };

    return (
        <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">IPFS Connection Status</h2>
            
            <div className="flex items-center space-x-2">
                <div
                    className={`w-3 h-3 rounded-full ${
                        connectionStatus === 'checking'
                            ? 'bg-yellow-400'
                            : connectionStatus === 'connected'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                    }`}
                />
                <span className="text-sm">
                    {connectionStatus === 'checking'
                        ? 'Checking IPFS connection...'
                        : connectionStatus === 'connected'
                        ? 'Connected to IPFS'
                        : 'Failed to connect to IPFS'}
                </span>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            {connectionStatus === 'connected' && (
                <p className="mt-2 text-sm text-green-600">
                    IPFS is properly configured and ready to use
                </p>
            )}

            {connectionStatus === 'failed' && (
                <button
                    onClick={checkConnection}
                    className="mt-4 px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Retry Connection
                </button>
            )}
        </div>
    );
}; 