'use client'

import { useState } from 'react';
import { sendMetamaskTransaction, getMetamaskExplorerUrl } from '../lib/Metamask';
import { getPhantomExplorerUrl, sendPhantomTransaction } from '../lib/Phantom';
import { sendPetraTransaction, getPetraExplorerUrl } from '../lib/Petra';


interface SendTransactionModalProps {   
    isOpen: boolean;
    onClose: () => void;
    walletInfo: {
        walletType: 'metamask' | 'phantom' | 'petra';
        chainId: string;
    };
    onSuccess: (hash: string, explorerUrl: string) => Promise<void>;
}

export default function SendTransactionModal({ 
    isOpen, 
    onClose, 
    walletInfo,
    onSuccess 
}: SendTransactionModalProps) {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

    const getCurrencySymbol = () => {
        switch (walletInfo?.walletType) {
            case 'metamask': return 'ETH';
            case 'phantom': return 'SOL';
            case 'petra': return 'APT';
            default: return '';
        }
    };

    const handleSend = async () => {
        setError(null);
        setTxHash(null);
        setExplorerUrl(null);
        setIsLoading(true);

        try {
            if (!recipientAddress || !amount) {
                throw new Error('Please fill in all fields');
            }

            if (walletInfo?.walletType === 'metamask' && !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
                throw new Error('Invalid Ethereum address format');
            }

            if (parseFloat(amount) <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            let hash: string;
            let url: string;
            
            switch (walletInfo?.walletType) {
                case 'metamask':
                    hash = await sendMetamaskTransaction(recipientAddress, amount);
                    url = getMetamaskExplorerUrl(walletInfo.chainId, hash);
                    break;
                case 'phantom':
                    hash = await sendPhantomTransaction(recipientAddress, amount);
                    url = getPhantomExplorerUrl(walletInfo.chainId, hash);
                    break;
                case 'petra':
                    hash = await sendPetraTransaction(recipientAddress, amount);
                    url = getPetraExplorerUrl(walletInfo.chainId, hash);
                    break;
                default:
                    throw new Error('Unknown wallet type');
            }

            setTxHash(hash);
            setExplorerUrl(url);
            onClose();
            await onSuccess(hash, url);
        } catch (err: any) {
            if (err.code === 4001) {
                setError('Transaction rejected by user');
            } else if (err.code === -32603) {
                setError('Insufficient funds for transaction');
            } else {
                setError(err instanceof Error ? err.message : 'Transaction failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#2A2A3C] rounded-xl p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-[#E0E0F6] mb-4">Send {getCurrencySymbol()}</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#A0A0C0] mb-1">Recipient Address</label>
                        <input 
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="w-full p-2 bg-[#323244] border border-[#3A3A4D] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#02f994]"
                            placeholder="Enter recipient address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#A0A0C0] mb-1">Amount</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.000000000000000001"
                            min="0"
                            className="w-full p-2 bg-[#323244] border border-[#3A3A4D] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#02f994]"
                            placeholder={`Amount in ${getCurrencySymbol()}`}
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[#3A3A4D] text-white rounded hover:bg-[#4A4A5D]"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-[#02f994] text-black font-semibold rounded hover:bg-[#00e085] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 