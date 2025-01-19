'use client'
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import ConnectButton from "./components/ConnectButton";
import { connectMetamask } from "./lib/Metamask";
import { connectPhantom } from "./lib/Phantom";
import { WalletConnectionError, WalletNotInstalledError } from "./utils/Errors";
import { connectPetra} from "./lib/Petra";
import { connectLeap } from "./lib/Leap";
import { setWalletInfo, setIsConnecting, setError } from './store/features/walletSlice';
import type { RootState } from './store/store';

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { error, isConnecting } = useSelector((state: RootState) => state.wallet);

    const connectWallet = async (
        connect: () => Promise<any>,
        type: 'metamask' | 'phantom' | 'petra' | 'leap'
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

    const handleError = (error: any) => {
        if (error instanceof WalletNotInstalledError || error instanceof WalletConnectionError) {
            dispatch(setError(error.message));
        } else {
            dispatch(setError('An unexpected error occurred'));
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
            connectMetaMask={connectMetaMask} 
            connectPhantom={connectPhantomWallet} 
            connectPetra={connectPetraWallet}
            connectLeap={connectLeapWallet}
            />
        </div>
    );
}
