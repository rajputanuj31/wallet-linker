import { ethers } from 'ethers';
import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

declare global {
    interface Window {
        ethereum: any;
    }
}

const CHAIN_NAMES: { [key: string]: string } = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
};

const CHAIN_EXPLORERS: { [key: string]: string } = {
    '0x1': 'https://etherscan.io',
    '0x5': 'https://goerli.etherscan.io',
    '0xaa36a7': 'https://sepolia.etherscan.io',
};

export const connectEthereum = async (): Promise<WalletInfo> => {
    try {
        if (!window.ethereum) {
            throw new WalletNotInstalledError();
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        const address = await signer.getAddress();
        const balance = ethers.formatEther(await provider.getBalance(address));
        const chainId = (await provider.getNetwork()).chainId.toString(16);
        const chainIdHex = `0x${chainId}`;
        const chainName = CHAIN_NAMES[chainIdHex] || 'Unknown Network';

        return {
            address,
            balance,
            chainId: chainIdHex,
            chainName,
        };
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message);
    }
};

export const sendTransaction = async (recipientAddress: string, amount: string): Promise<string> => {
    try {
        if (!window.ethereum) {
            throw new WalletNotInstalledError();
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Convert amount from ETH to Wei
        const amountInWei = ethers.parseEther(amount);

        const tx = {
            to: recipientAddress,
            value: amountInWei,
        };

        // Send transaction
        const transaction = await signer.sendTransaction(tx);
        
        // Wait for transaction to be mined
        const receipt = await transaction.wait();
        
        return receipt?.hash || transaction.hash;
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message);
    }
};

export const getExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
};
