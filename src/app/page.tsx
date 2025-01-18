'use client';
import { useState } from 'react';
import ConnectButton from "./components/ConnectButton";
import { connectEthereum } from "./lib/Ethereum";
import { WalletConnectionError, WalletNotInstalledError } from "./utils/Errors";
import { useRouter } from 'next/navigation';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
    walletType?: 'metamask';
}

export default function Home() {
    const router = useRouter();
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const connectMetaMask = async () => {
        try {
            setError(null);
            const info = await connectEthereum();
            const walletInfoWithType = { ...info, walletType: 'metamask' as const };
            setWalletInfo(walletInfoWithType);
            router.push(`/accountInfo?type=metamask`);
        } catch (error) {
            handleError(error);
        }
    };

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
            <ConnectButton connectMetaMask={connectMetaMask} />
        </div>
    );
}
