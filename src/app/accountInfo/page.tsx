'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SendTransactionModal from '../components/SendTransaction';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
    walletType: 'metamask'| "phantom" | "petra";
}

export default function AccountInfo() {
    const router = useRouter();
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);


    useEffect(() => {
        const fetchWalletInfo = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const walletType = searchParams.get('type');
                
                let info;
                switch (walletType) {
                    case 'metamask':
                        const { connectMetamask } = await import('../lib/Metamask');
                        info = await connectMetamask();
                        setWalletInfo({ ...info, walletType: 'metamask' });
                        break;
                    case 'phantom':
                        const { connectPhantom } = await import('../lib/Phantom');
                        info = await connectPhantom();
                        setWalletInfo({ ...info, walletType: 'phantom' });
                        break;
                    case 'petra':
                        const { connectPetra } = await import('../lib/Petra');
                        info = await connectPetra();
                        setWalletInfo({ ...info, walletType: 'petra' });
                        break;
                    default:
                        router.push('/');
                        return;
                }
            } catch (error) {
                console.error('Failed to fetch wallet info:', error);
                router.push('/');
            }
        };

        fetchWalletInfo();
    }, [router]);

    const handleDisconnect = async () => {
        setWalletInfo(null);
        router.push('/');
    };

    useEffect(() => {
        const handleAccountsChanged = async () => {
            await refreshWalletInfo();
        };

        if (walletInfo?.walletType === 'metamask' && window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleAccountsChanged);
        } else if (walletInfo?.walletType === 'phantom' && window.solana) {
            window.solana.on('accountChanged', handleAccountsChanged);
        }else if (walletInfo?.walletType === 'petra') {
            const accountUnsubscribe = window.aptos?.onAccountChange(handleAccountsChanged);
            const networkUnsubscribe = window.aptos?.onNetworkChange(handleAccountsChanged);
            return () => {
                accountUnsubscribe?.();
                networkUnsubscribe?.();
            };
        }

        return () => {
            if (walletInfo?.walletType === 'metamask' && window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleAccountsChanged);
            } else if (walletInfo?.walletType === 'phantom' && window.solana) {
                window.solana.removeListener('accountChanged', handleAccountsChanged);
            } else if (walletInfo?.walletType === 'petra' && window.aptos) {
                window.aptos.removeListener('accountChanged', handleAccountsChanged);
            }
        };
    }, [walletInfo?.walletType]);

    const getCurrencySymbol = () => {
        switch (walletInfo?.walletType) {
            case 'metamask': return 'ETH';
            case 'phantom': return 'SOL';
            case 'petra': return 'APT';
            default: return '';
        }
    };
    
    const refreshWalletInfo = async () => {
        if (!walletInfo || isRefreshing) return;

        try {
            setIsRefreshing(true);
            let newWalletInfo;
            switch (walletInfo.walletType) {
                case 'metamask':
                    const { connectMetamask } = await import('../lib/Metamask');
                    newWalletInfo = await connectMetamask();
                    setWalletInfo({ ...newWalletInfo, walletType: 'metamask' });
                    break;
                case 'phantom':
                    const { connectPhantom } = await import('../lib/Phantom');
                    newWalletInfo = await connectPhantom();
                    setWalletInfo({ ...newWalletInfo, walletType: 'phantom' });
                    break;
                case 'petra':
                    const { connectPetra } = await import('../lib/Petra');
                    newWalletInfo = await connectPetra();
                    setWalletInfo({ ...newWalletInfo, walletType: 'petra' });
                    break;
            }
        } catch (error) {
            console.error('Failed to refresh wallet info:', error);
            router.push('/');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleTransactionSuccess = async (hash: string, url: string) => {
        setTxHash(hash);
        setExplorerUrl(url);
        await refreshWalletInfo();
    };

    if (!walletInfo) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D3A] p-8 pb-20 sm:p-20">
            <div className="max-w-2xl mx-auto bg-[#2A2A3C] rounded-xl shadow-2xl p-8 border border-[#3A3A4D]">
                <div className="flex justify-between items-center border-b border-[#3A3A4D] pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#E0E0F6]">Wallet Information</h1>
                        <p className="text-[#A0A0C0] mt-1">Connected with MetaMask</p>
                    </div>
                    <button 
                        onClick={handleDisconnect}
                        className="px-6 py-2 bg-[#fc6977] text-black font-semibold shadow-md hover:scale-105 transform transition-transform"
                    >
                        Disconnect
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Address</span>
                        <span className="font-mono text-sm bg-[#28283A] px-3 py-1 rounded border border-[#3A3A4D] text-[#F0F0FF] break-all">
                            {walletInfo.address}
                        </span>
                    </div>
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Balance</span>
                        <span className="text-lg text-[#4ADE80] font-medium">
                        {walletInfo.balance} {getCurrencySymbol()}
                        </span>
                    </div>
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Network</span>
                        <span className="text-[#A78BFA]">
                            {walletInfo.chainName} <span className="text-[#707090] text-sm">({walletInfo.chainId})</span>
                        </span>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-4">
                        <button 
                            onClick={() => setShowSendModal(true)}
                            className="px-8 py-3 bg-[#02f994] text-black font-semibold rounded-lg shadow-md hover:scale-105 transform transition-transform flex items-center gap-2"
                        >
                            Send {getCurrencySymbol()}
                        </button>
                        {txHash && (
                            <div className="text-center">
                                <p className="text-green-500 text-sm">
                                    Transaction Hash: <span className="font-mono">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                                </p>
                                {explorerUrl && (
                                    <a
                                        href={explorerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#02f994] hover:text-[#00e085] text-sm mt-1 inline-block"
                                    >
                                        View on Explorer →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SendTransactionModal 
                isOpen={showSendModal}
                onClose={() => setShowSendModal(false)}
                walletInfo={walletInfo}
                onSuccess={handleTransactionSuccess}
            />
        </div>
    );
}
