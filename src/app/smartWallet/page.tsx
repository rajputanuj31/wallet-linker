'use client'

import { useRouter } from 'next/navigation';
import {
    useUser,
    useLogout,
    useSignerStatus,
    useSmartAccountClient,
    useSendUserOperation
} from "@account-kit/react";
import { useEffect, useState } from 'react';

export default function SmartWallet() {
    const router = useRouter();
    const user = useUser();
    const { logout } = useLogout();
    const signerStatus = useSignerStatus();
    const { client } = useSmartAccountClient({ type: "LightAccount" });
    const [balance, setBalance] = useState<string>('Loading...');

    // const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    //     client,
    //     waitForTxn: true,
    //     onSuccess: async ({ hash, request }) => {
    //         console.log('Transaction successful:', hash);
    //         // Refresh balance after successful transaction
    //         if (client && user?.address) {
    //             console.log('client', client);
    //             const newBalance = await client.getBalance({ address: user.address });
    //             setBalance(newBalance.toString());
    //         }
    //     },
    //     onError: (error) => {
    //         console.error('Transaction failed:', error);
    //     },
    // });

    // Fetch balance immediately when client and address are available
    useEffect(() => {
        const fetchBalance = async () => {
            if (client && user?.address) {
                try {
                    const bal = await client.getBalance({ address: user.address });
                    // Convert wei to ETH by dividing by 10^18
                    const balanceInEth = Number(bal) / Math.pow(10, 18);
                    setBalance(balanceInEth.toFixed(4)); // Show 4 decimal places
                } catch (error) {
                    console.error('Error fetching balance:', error);
                    setBalance('Error loading balance');
                }
            }
        };

        fetchBalance();

    }, [client, user?.address]);

    useEffect(() => {
        if (!signerStatus.isInitializing && !signerStatus.isAuthenticating && !user?.email) {
            router.replace('/'); // Using replace instead of push
        }
    }, [user, signerStatus, router]);

    // Show loading state while checking authentication
    if (signerStatus.isInitializing || signerStatus.isAuthenticating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D3A] flex items-center justify-center">
                <div className="flex items-center text-white">
                    <div className="w-5 h-5 border-2 border-[#02f994] border-t-transparent rounded-full animate-spin mr-2" />
                    {signerStatus.isInitializing ? 'Initializing...' : 'Authenticating...'}
                </div>
            </div>
        );
    }

    if (!user?.email) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#1E1E2F] to-[#2D2D3A] p-8">
            <div className="max-w-2xl mx-auto bg-[#2A2A3C] rounded-xl shadow-2xl p-8 border border-[#3A3A4D] mt-20">
                <h1 className="text-3xl font-bold text-[#02f994] mb-6">
                    Smart Wallet Details
                </h1>

                <div className="space-y-6">
                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Email</span>
                        <span className="text-[#F0F0FF]">
                            {user.email}
                        </span>
                    </div>

                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Wallet Address</span>
                        <span className="font-mono text-sm bg-[#28283A] px-3 py-1 rounded border border-[#3A3A4D] text-[#F0F0FF] break-all block">
                            {user.address}
                        </span>
                    </div>

                    <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <span className="font-semibold text-[#C0C0E0] block mb-1">Balance</span>
                        <span className="text-[#F0F0FF]">
                            {balance} ETH
                        </span>
                    </div>

                    {/* <div className="bg-[#323244] p-4 rounded-lg hover:bg-[#3B3B54] transition-colors">
                        <button
                            onClick={() =>
                                sendUserOperation({
                                    uo: {
                                        target: "0xTARGET_ADDRESS",
                                        data: "0x",
                                        value: BigInt(0),
                                    },
                                })
                            }
                            disabled={isSendingUserOperation}
                            className="w-full px-6 py-2 bg-[#02f994] text-black hover:bg-[#00e085] transition-colors rounded disabled:opacity-50"
                        >
                            {isSendingUserOperation ? "Sending..." : "Send Transaction"}
                        </button>
                    </div> */}

                    <div className="flex flex-col gap-4 mt-8 ">
                        <button
                            onClick={() => logout()}
                            className="w-full px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors rounded"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </main>
    );
}