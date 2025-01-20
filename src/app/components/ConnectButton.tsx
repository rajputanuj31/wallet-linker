'use client'

import React, { useState } from 'react';

interface ConnectButtonProps {
    connectMetaMask: () => Promise<void>;
    connectPhantom: () => Promise<void>;
    connectPetra: () => Promise<void>;
    connectLeap: () => Promise<void>;
    connectRabby: () => Promise<void>;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
    connectMetaMask, 
    connectPhantom, 
    connectPetra    , 
    connectLeap,
    connectRabby 
}) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    const chainOptions = [
        {
            id: 'ethereum',
            name: 'Ethereum',
            color: 'bg-[#14F195]',
            wallets: [
                { id: 'metamask', name: 'MetaMask', connect: connectMetaMask },
                { id: 'rabby', name: 'Rabby', connect: connectRabby }
            ]
        },
        {
            id: 'solana',
            name: 'Solana',
            color: 'bg-[#14F195]',
            wallets: [
                { id: 'phantom', name: 'Phantom', connect: connectPhantom }
            ]
        },
        {
            id: 'aptos',
            name: 'Aptos',
            color: 'bg-[#02f994]',
            wallets: [
                { id: 'petra', name: 'Petra', connect: connectPetra }
            ]
        },
        {
            id: 'cosmos',
            name: 'Cosmos',
            color: 'bg-[#02f994]',
            wallets: [
                { id: 'leap', name: 'Leap', connect: connectLeap }
            ]
        }
    ];

    const handleConnect = (connect: () => void) => {
        setShowModal(false);
        setSelectedChain(null);
        connect();
    };

    const handleChainSelect = (chainId: string) => {
        setSelectedChain(chainId);
    };

    const handleBack = () => {
        setSelectedChain(null);
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-8 py-2 bg-[#fc6977] text-black font-medium shadow-lg hover:shadow-2xl active:scale-[0.98] transition-all duration-200"
            >
                Connect Wallet
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#1E1E2A] rounded-2xl shadow-xl border border-[#3B3B4F] p-6 w-80 relative">
                        <button 
                            onClick={() => {
                                setShowModal(false);
                                setSelectedChain(null);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-center mb-6">
                            {selectedChain && (
                                <button
                                    onClick={handleBack}
                                    className="mr-2 text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-[#02f994]">
                                {selectedChain ? 'Select Wallet' : 'Select Chain'}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {!selectedChain ? (
                                // Show chain options
                                chainOptions.map((chain) => (
                                    <button
                                        key={chain.id}
                                        onClick={() => handleChainSelect(chain.id)}
                                        className={`w-full p-2 text-black font-medium shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200 ${chain.color}`}
                                    >
                                        {chain.name}
                                    </button>
                                ))
                            ) : (
                                // Show wallet options for selected chain
                                chainOptions
                                    .find(chain => chain.id === selectedChain)
                                    ?.wallets.map((wallet) => (
                                        <button
                                            key={wallet.id}
                                            onClick={() => handleConnect(wallet.connect)}
                                            className="w-full p-2 text-black font-medium shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200 bg-[#02f994]"
                                        >
                                            {wallet.name}
                                        </button>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConnectButton;
