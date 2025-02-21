import { ethers } from 'ethers';
import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

interface EthereumProvider {
    isMetaMask?: boolean;
    isRabby?: boolean;
}

interface EIP6963ProviderDetail {
    info: {
        uuid: string;
        name: string;
        icon: string;
        rdns: string;
    };
    provider: EthereumProvider;
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

export const connectMetamask = async (): Promise<WalletInfo> => {
    try {
        if (!window.ethereum) {
            throw new WalletNotInstalledError('MetaMask wallet is not installed.');
        }

        let provider;

        // Check for EIP-6963 providers
        if (window.ethereum.eip6963ProviderDetails) {
            const metamaskProvider = window.ethereum.eip6963ProviderDetails.find(
                (detail: EIP6963ProviderDetail) => detail.info.rdns === 'io.metamask'
            );
            provider = metamaskProvider?.provider;
        } else if (window.ethereum.isMetaMask) {
            provider = window.ethereum;
        }

        if (!provider) {
            throw new WalletNotInstalledError('MetaMask wallet is not installed.');
        }

        const ethersProvider = new ethers.BrowserProvider(provider);
        await ethersProvider.send("eth_requestAccounts", []);
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
        throw new WalletConnectionError(error.message);
    }
};


export const sendMetamaskTransaction = async (recipientAddress: string, amount: string): Promise<string> => {
    try {
        if (!window.ethereum) {
            throw new WalletNotInstalledError('MetaMask wallet is not installed.');
        }

        let provider;

        // Check for EIP-6963 providers
        if (window.ethereum.eip6963ProviderDetails) {
            const metamaskProvider = window.ethereum.eip6963ProviderDetails.find(
                (detail: EIP6963ProviderDetail) => detail.info.rdns === 'io.metamask'
            );
            provider = metamaskProvider?.provider;
        } else if (window.ethereum.isMetaMask) {
            provider = window.ethereum;
        }

        if (!provider) {
            throw new WalletNotInstalledError('MetaMask wallet is not installed.');
        }

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        // Convert amount from ETH to Wei
        const amountInWei = ethers.parseEther(amount);

        const tx = {
            to: recipientAddress,
            value: amountInWei,
        };

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

export const getMetamaskExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
};
