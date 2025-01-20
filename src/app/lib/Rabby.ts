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
        ethereum: any & {
            isRabby?: boolean;
            isMetaMask?: boolean;
            providers?: any[];
        };
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

const getRabbyProvider = () => {
    if (!window.ethereum) {
        throw new WalletNotInstalledError('Rabby wallet is not installed');
    }

    // Check if we have multiple providers
    if (Array.isArray(window.ethereum.providers)) {
        const rabbyProvider = window.ethereum.providers.find((p: any) => p.isRabby);
        if (rabbyProvider) {
            return rabbyProvider;
        }
    }

    // Check if the main provider is Rabby
    if (window.ethereum.isRabby) {
        return window.ethereum;
    }

    throw new WalletNotInstalledError('Rabby wallet is not installed');
};

export const connectRabby = async (): Promise<WalletInfo> => {
    try {
        const provider = getRabbyProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        
        await provider.request({ method: 'eth_requestAccounts' });
        
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        const balance = ethers.formatEther(await ethersProvider.getBalance(address));
        const chainId = (await ethersProvider.getNetwork()).chainId.toString(16);
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
        throw new WalletConnectionError(error.message || 'Failed to connect to Rabby wallet');
    }
};

export const sendRabbyTransaction = async (recipientAddress: string, amount: string): Promise<string> => {
    try {
        const provider = getRabbyProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        const amountInWei = ethers.parseEther(amount);

        const tx = {
            to: recipientAddress,
            value: amountInWei,
        };

        const transaction = await signer.sendTransaction(tx);
        const receipt = await transaction.wait();
        
        return receipt?.hash || transaction.hash;
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message || 'Failed to send transaction with Rabby wallet');
    }
};

export const getRabbyExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || CHAIN_EXPLORERS['0x1'];
    return `${baseUrl}/tx/${txHash}`;
};

