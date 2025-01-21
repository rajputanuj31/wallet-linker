'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SendTransactionModal from '../components/SendTransaction';
import { useDispatch, useSelector } from 'react-redux'
import { setWalletInfo, resetWallet, setTransactionInfo } from '../store/features/walletSlice'
import type { RootState } from '../store/store'

export default function AccountInfo() {
    const router = useRouter();
    const dispatch = useDispatch();
    const walletInfo = useSelector((state: RootState) => state.wallet);
    const [showSendModal, setShowSendModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);


    useEffect(() => {
        const fetchWalletInfo = async () => {
            try {
                if (walletInfo?.address && walletInfo?.walletType) {
                    await refreshWalletInfo();
                    setIsInitialized(true);
                    return;
                }

                const searchParams = new URLSearchParams(window.location.search);
                const walletType = searchParams.get('type');
                
                if (!walletType) {
                    router.push('/');
                    return;
                }

                let info;
                switch (walletType) {
                    case 'metamask':
                        const { connectMetamask } = await import('../lib/Metamask');
                        info = await connectMetamask();
                        dispatch(setWalletInfo({ ...info, walletType: 'metamask' }));
                        break;
                    case 'phantom':
                        const { connectPhantom } = await import('../lib/Phantom');
                        info = await connectPhantom();
                        dispatch(setWalletInfo({ ...info, walletType: 'phantom' }));
                        break;
                    case 'petra':
                        const { connectPetra } = await import('../lib/Petra');
                        info = await connectPetra();
                        dispatch(setWalletInfo({ ...info, walletType: 'petra' }));
                        break;
                    case 'leap':
                        const { connectLeap } = await import('../lib/Leap');
                        info = await connectLeap();
                        dispatch(setWalletInfo({ ...info, walletType: 'leap' }));
                        break;
                    case 'rabby':
                        const { connectRabby } = await import('../lib/Rabby');
                        info = await connectRabby();
                        dispatch(setWalletInfo({ ...info, walletType: 'rabby' }));
                        break;
                    default:
                        router.push('/');
                        return;
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to fetch wallet info:', error);
                dispatch(resetWallet());
                router.push('/');
            }
        };

        fetchWalletInfo();
    }, []);

    const handleDisconnect = async () => {
        dispatch(resetWallet());
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
            case 'leap': return 'ATOM';
            case 'rabby': return 'ETH';
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
                    dispatch(setWalletInfo({ ...newWalletInfo, walletType: 'metamask' }));
                    break;
                case 'phantom':
                    const { connectPhantom } = await import('../lib/Phantom');
                    newWalletInfo = await connectPhantom();
                    dispatch(setWalletInfo({ ...newWalletInfo, walletType: 'phantom' }));
                    break;
                case 'petra':
                    const { connectPetra } = await import('../lib/Petra');
                    newWalletInfo = await connectPetra();
                    dispatch(setWalletInfo({ ...newWalletInfo, walletType: 'petra' }));
                    break;
                case 'leap':
                    const { connectLeap } = await import('../lib/Leap');
                    newWalletInfo = await connectLeap();
                    dispatch(setWalletInfo({ ...newWalletInfo, walletType: 'leap' }));
                    break;
            }
        } catch (error) {
            console.error('Failed to refresh wallet info:', error);
            dispatch(resetWallet());
            router.push('/');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleTransactionSuccess = async (hash: string, url: string) => {
        dispatch(setTransactionInfo({ txHash: hash, explorerUrl: url }));
        await refreshWalletInfo();
    };

    const getWalletDisplayName = () => {
        if (!walletInfo.walletType) return '';
        return walletInfo.walletType.charAt(0).toUpperCase() + walletInfo.walletType.slice(1);
    };

    useEffect(() => {
        if (isInitialized && !walletInfo?.walletType) {
            router.push('/');
        }
    }, [isInitialized, walletInfo?.walletType, router]);

    if (!isInitialized || !walletInfo?.walletType) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D3A] p-8 pb-20 sm:p-20">
            <div className="max-w-2xl mx-auto bg-[#2A2A3C] rounded-xl shadow-2xl p-8 border border-[#3A3A4D]">
                <div className="flex justify-between items-center border-b border-[#3A3A4D] pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#fc6977]">
                            Wallet Information
                        </h1>
                        <p className="text-[#A0A0C0] mt-1">
                            Connected with {getWalletDisplayName()}
                        </p>
                    </div>
                    <button 
                        onClick={handleDisconnect}
                        className="px-6 py-2 bg-[#fc6977] text-black font-semibold shadow-md hover:scale-105 transform transition-transform"
                    >
                        Disconnect
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors w-full">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Address </span>
                        <span className="font-mono text-sm bg-[#28283A] px-3 py-1 rounded border border-[#3A3A4D] text-[#F0F0FF] break-all w-full inline-block">
                            {walletInfo.address}
                        </span>
                    </div>
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors relative">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Balance </span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg text-[#4ADE80] font-medium">
                                {walletInfo.balance} {getCurrencySymbol()}
                            </span>
                            {isRefreshing && (
                                <div className="w-4 h-4 border-2 border-[#02f994] border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                    </div>
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Network </span>
                        <span className="text-[#A78BFA]">
                            {walletInfo.chainName} <span className="text-[#707090] text-sm">({walletInfo.chainId})</span>
                        </span>
                    </div>
                    
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <button 
                            onClick={() => setShowSendModal(true)}
                            className="px-8 py-2 bg-[#02f994] text-black font-semibold shadow-md hover:scale-105 transform transition-transform flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            Send {getCurrencySymbol()}
                        </button>
                        {walletInfo.txHash && (
                            <div className="text-center">
                                <p className="text-green-500 text-sm">
                                    Transaction Hash: <span className="font-mono">{walletInfo.txHash.slice(0, 10)}...{walletInfo.txHash.slice(-8)}</span>
                                </p>
                                {walletInfo.explorerUrl && (
                                    <a
                                        href={walletInfo.explorerUrl}
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
