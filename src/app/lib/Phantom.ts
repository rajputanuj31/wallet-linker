import { Connection, clusterApiUrl,Transaction,SystemProgram, PublicKey } from '@solana/web3.js';
import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

declare global {
    interface Window {
        solana?: {
            isPhantom?: boolean;
            connect: () => Promise<{ publicKey: PublicKey }>;
            disconnect: () => Promise<void>;
            isConnected?: boolean;
            publicKey: PublicKey | null;
            signTransaction: (transaction: Transaction) => Promise<Transaction>;
            on: (event: string, callback: () => void) => void;
            removeListener: (event: string, callback: () => void) => void;
        };
    }
}

const CHAIN_NAMES: { [key: string]: string } = {
    'mainnet-beta': 'Solana Mainnet',
    'testnet': 'Solana Testnet',
    'devnet': 'Solana Devnet',
};

const CHAIN_EXPLORERS: { [key: string]: string } = {
    'mainnet-beta': 'https://explorer.solana.com',
    'testnet': 'https://explorer.solana.com/?cluster=testnet',
    'devnet': 'https://explorer.solana.com',
};

export const connectPhantom = async (): Promise<WalletInfo> => {
    try {
        if (!window.solana || !window.solana.isPhantom) {
            throw new WalletNotInstalledError('Phantom wallet is not installed');
        }

        const response = await window.solana.connect();
        const address = response.publicKey.toString();

        const cluster = 'devnet'; 
        const connection = new Connection(clusterApiUrl(cluster));

        const balanceLamports = await connection.getBalance(new PublicKey(address));
        const balance = (balanceLamports / 1_000_000_000).toFixed(4); 

        const chainName = CHAIN_NAMES[cluster];

        return {
            address,
            balance,
            chainId: cluster,
            chainName,
        };
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message || 'Failed to connect to Phantom wallet');
    }
};


export const sendPhantomTransaction = async (recipientAddress: string, amount: string): Promise<string> => {
    try {
        if (!window.solana || !window.solana.isPhantom) {
            throw new WalletNotInstalledError('Phantom wallet is not installed');
        }

        if (!window.solana.isConnected) {
            await window.solana.connect();
        }

        const senderPublicKey = window.solana.publicKey;
        if (!senderPublicKey) {
            throw new WalletConnectionError('Failed to retrieve public key from Phantom wallet');
        }

        const cluster = 'devnet';
        const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

        const recipientPublicKey = new PublicKey(recipientAddress);

        const amountLamports = Math.round(Number(amount) * 1_000_000_000);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: recipientPublicKey,
                lamports: amountLamports,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;

        const signedTransaction = await window.solana.signTransaction(transaction);

        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        await connection.confirmTransaction(signature, 'confirmed');

        return signature; 
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError || error instanceof WalletConnectionError) {
            throw error;
        }
        throw new WalletConnectionError(error.message || 'Failed to send transaction with Phantom wallet');
    }
};

export const getPhantomExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || CHAIN_EXPLORERS['devnet'];
    return `${baseUrl}/tx/${txHash}`;
};
