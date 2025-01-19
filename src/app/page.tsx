'use client';
import { useState } from 'react';
import ConnectButton from "./components/ConnectButton";
import { connectMetamask } from "./lib/Metamask";
import {connectPhantom} from "./lib/Phantom"
import { connectPetra } from "./lib/Petra";
import { WalletConnectionError, WalletNotInstalledError } from "./utils/Errors";
import { useRouter } from 'next/navigation';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
    walletType?: 'metamask' | 'phantom' | 'petra';
}

export default function Home() {
    const router = useRouter();
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);


    const connectWallet = async (
        connect: () => Promise<WalletInfo>,
        type: WalletInfo['walletType']
    ) => {
        try {
            setError(null);
            setIsConnecting(true);
            const info = await connect();
            const walletInfoWithType = { ...info, walletType: type };
            setWalletInfo(walletInfoWithType);
            router.push(`/accountInfo?type=${type}`);
        } catch (error) {
            handleError(error);
            setIsConnecting(false);
        }
    };

    const connectMetaMaskWallet = () => connectWallet(connectMetamask, 'metamask');
    const connectPhantomWallet = () => connectWallet(connectPhantom, 'phantom');
    const connectPetraWallet = () => connectWallet(connectPetra, 'petra');

    const handleError = (error: any) => {
        if (error instanceof WalletNotInstalledError || error instanceof WalletConnectionError) {
            setError(error.message);
        } else {
            setError('An unexpected error occurred');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                    bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}
            <ConnectButton 
            connectMetaMask={connectMetaMaskWallet} 
            connectPhantom={connectPhantomWallet} 
            connectPetra={connectPetraWallet}
            />
        </div>
    );
}
