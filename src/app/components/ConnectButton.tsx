'use client'

import React, { useState } from 'react';

interface ConnectButtonProps {
    connectMetaMask: () => Promise<void>;
    connectPhantom: () => Promise<void>;
    connectPetra: () => Promise<void>;
    connectCosmos: () => Promise<void>;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ connectMetaMask, connectPhantom, connectPetra, connectCosmos }) => {
    const [showModal, setShowModal] = useState(false);

    const walletOptions = [
        {
            id: 'ethereum',
            name: 'MetaMask',
            color: 'bg-[#02f994]',
            connect: connectMetaMask,
        },
        {
            id: 'solana',
            name: 'Phantom',
            color: 'bg-[#02f994]',
            connect: connectPhantom,
        },
        {
            id: 'aptos',
            name: 'Petra',
            color: 'bg-[#02f994]',
            connect: connectPetra,
        },
        {
            id: 'cosmos',
            name: 'Cosmos',
            color: 'bg-[#02f994]',
            connect: connectCosmos,
        },
    ];

    const handleConnect = (connect: () => void) => {
        setShowModal(false);
        connect();
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-8 py-2  bg-[#fc6977] text-black font-medium shadow-lg hover:shadow-2xl active:scale-[0.98] transition-all duration-200"
            >
                Connect Wallet
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1E1E2A] rounded-2xl shadow-xl border border-[#3B3B4F] p-6 w-80 relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">
                            Connect Wallet
                        </h2>

                        <div className="space-y-3">
                            {walletOptions.map((wallet) => (
                                <button
                                    key={wallet.id}
                                    onClick={() => handleConnect(wallet.connect)}
                                    className={`w-full p-2 text-black font-medium shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200 ${wallet.color}`}
                                >
                                    Connect {wallet.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConnectButton;
