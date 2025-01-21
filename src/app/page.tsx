'use client'
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import ConnectButton from "./components/ConnectButton";
import { connectMetamask } from "./lib/Metamask";
import { connectPhantom } from "./lib/Phantom";
import { WalletConnectionError, WalletNotInstalledError } from "./utils/Errors";
import { connectPetra } from "./lib/Petra";
import { connectLeap } from "./lib/Leap";
import { connectRabby } from "./lib/Rabby";
import { setWalletInfo, setIsConnecting, setError } from './store/features/walletSlice';
import type { RootState } from './store/store';
import {
    useAuthModal,
    useLogout,
    useSignerStatus,
    useUser,
} from "@account-kit/react";
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { error, isConnecting } = useSelector((state: RootState) => state.wallet);
    const user = useUser();
    const { openAuthModal } = useAuthModal();
    const signerStatus = useSignerStatus();
    const { logout } = useLogout();

    useEffect(() => {
        if (user?.email && !signerStatus.isInitializing) {
            router.replace('/smartWallet');
        }
    }, [user?.email, signerStatus.isInitializing, router]);

    const connectWallet = async (
        connect: () => Promise<any>,
        type: 'metamask' | 'phantom' | 'petra' | 'leap' | 'rabby'
    ) => {
        try {
            dispatch(setError(null));
            dispatch(setIsConnecting(true));
            const info = await connect();
            dispatch(setWalletInfo({ ...info, walletType: type }));
            router.push(`/accountInfo?type=${type}`);
        } catch (error) {
            handleError(error);
        } finally {
            dispatch(setIsConnecting(false));
        }
    };

    const connectMetaMask = () => connectWallet(connectMetamask, 'metamask');
    const connectPhantomWallet = () => connectWallet(connectPhantom, 'phantom');
    const connectPetraWallet = () => connectWallet(connectPetra, 'petra');
    const connectLeapWallet = () => connectWallet(connectLeap, 'leap');
    const connectRabbyWallet = () => connectWallet(connectRabby, 'rabby');
    const handleError = (error: any) => {
        if (error instanceof WalletNotInstalledError || error instanceof WalletConnectionError) {
            dispatch(setError(error.message));
        } else {
            dispatch(setError('An unexpected error occurred'));
        }
    };

    const handleSmartWalletRedirect = () => {
        if (user?.email) {
            router.push('/smartWallet');
        }
    };

    return (
        <main className="min-h-screen pt-16 bg-gradient-to-br from-[#1E1E2F] to-[#2D2D3A]">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
                    {error && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                            bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="text-center space-y-12">
                        <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent 
                            bg-gradient-to-r from-[#02f994] to-[#00e085] tracking-tight">
                            Multi-Chain Wallet Hub
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-gray-300/80">
                            Connect and manage your crypto wallets across multiple blockchains.
                            Secure, seamless, and simple.
                        </p>

                        {isConnecting ? (
                            <div className="text-white flex items-center justify-center mx-auto w-48 gap-3 bg-white/5 px-6 py-3 rounded-lg">
                                <div className="w-5 h-5 border-2 border-[#02f994] border-t-transparent rounded-full animate-spin" />
                                Connecting...
                            </div>
                        ) : (
                            <ConnectButton
                                connectMetaMask={connectMetaMask}
                                connectPhantom={connectPhantomWallet}
                                connectPetra={connectPetraWallet}
                                connectLeap={connectLeapWallet}
                                connectRabby={connectRabbyWallet}
                            />
                        )}

                        {signerStatus.isInitializing ? (
                            <>Loading...</>
                        ) : user ? (

                                    <div className="flex flex-col items-center gap-2">

                                            <button
                                                className="px-6 py-2 bg-[#f93702] text-black hover:bg-[#00e085] transition-colors"
                                                onClick={() => logout()}
                                            >
                                                Logout Demo account
                                            </button>
                                    </div>
                        ) : (
                            <button
                                className="px-6 py-2 bg-[#02f994] text-black   hover:bg-[#00e085] transition-colors"
                                onClick={openAuthModal}
                            >
                                Create a Smart Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
