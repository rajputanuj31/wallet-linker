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

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { error, isConnecting } = useSelector((state: RootState) => state.wallet);
    const user = useUser();
    const { openAuthModal } = useAuthModal();
    const signerStatus = useSignerStatus();
    const { logout } = useLogout();

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-8">
                {isConnecting ? (
                    <div className="text-white flex items-center gap-3 bg-white/5 px-6 py-3 rounded-lg">
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
            </div>
            {signerStatus.isInitializing ? (
                <>Loading...</>
            ) : user ? (
                <div className="flex flex-col text-center items-center gap-2 p-2">
                    <p className="text-xl font-bold">Success!</p>
                    <p className="text-white">Logged in as {user.email ?? "anon"}.</p>
                    <p className="text-white">Address: {user.address}.</p>

                    <button
                        className="px-6 py-2 bg-red-500 text-white w-48 hover:bg-red-600 transition-colors mt-6"
                        onClick={() => logout()}
                    >
                        Log out
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
    );
}
