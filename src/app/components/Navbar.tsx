'use client'

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function Navbar() {
    const router = useRouter();
    const walletInfo = useSelector((state: RootState) => state.wallet);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E2F]/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl">🔗</div>
                            <div className="text-xl font-bold bg-gradient-to-r from-[#02f994] to-[#00e085] bg-clip-text text-transparent">
                                Wallet-Linker
                            </div>
                        </div>
                    </div>

                    {walletInfo?.address && (
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-[#02f994]"></div>
                            <span className="text-sm text-gray-300">
                                {`${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`}
                            </span>
                        </div>
                    )}

                    <div className="md:hidden">
                        <button className="text-gray-300 hover:text-white p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 