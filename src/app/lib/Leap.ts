import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

declare global {
    interface Window {
        leap?: {
            enable: (chainId: string) => Promise<void>;
            getKey: (chainId: string) => Promise<{ bech32Address: string }>;
            getOfflineSignerAuto: (chainId: string) => any;
            isLeap?: boolean;
        };
    }
}

const CHAIN_NAMES: { [key: string]: string } = {
    'cosmoshub-4': 'Cosmos Hub',
    'osmosis-1': 'Osmosis',
    'juno-1': 'Juno',
};

const CHAIN_RPCS: { [key: string]: string } = {
    'cosmoshub-4': 'https://cosmos-rpc.publicnode.com',
    'osmosis-1': 'https://osmosis-rpc.publicnode.com',
    'juno-1': 'https://juno-rpc.publicnode.com',
};

const CHAIN_EXPLORERS: { [key: string]: string } = {
    'cosmoshub-4': 'https://www.mintscan.io/cosmos',
    'osmosis-1': 'https://www.mintscan.io/osmosis',
    'juno-1': 'https://www.mintscan.io/juno',
};

export const connectLeap = async (chainId: string = 'cosmoshub-4'): Promise<WalletInfo> => {
    try {
        if (!window.leap) {
            throw new WalletNotInstalledError('Leap wallet is not installed');
        }

        await window.leap.enable(chainId);

        const key = await window.leap.getKey(chainId);
        const address = key.bech32Address;

        const rpcEndpoint = CHAIN_RPCS[chainId];
        if (!rpcEndpoint) {
            throw new Error('Unsupported chain');
        }

        const client = await StargateClient.connect(rpcEndpoint);
        
        const balance = await client.getAllBalances(address);
        const mainBalance = balance.length > 0 ? 
            (parseInt(balance[0].amount) / 1_000_000).toFixed(6) : 
            '0';

        return {
            address,
            balance: mainBalance,
            chainId,
            chainName: CHAIN_NAMES[chainId] || 'Unknown Network',
        };
    } catch (error: any) {
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message || 'Failed to connect to Leap wallet');
    }
};

export const sendLeapTransaction = async (
    recipientAddress: string, 
    amount: string, 
    chainId: string = 'cosmoshub-4'
): Promise<string> => {
    try {
        if (!window.leap) {
            throw new WalletNotInstalledError('Leap wallet is not installed');
        }

        const rpcEndpoint = CHAIN_RPCS[chainId];
        if (!rpcEndpoint) {
            throw new Error('Unsupported chain');
        }

        const offlineSigner = window.leap.getOfflineSignerAuto(chainId);
        const accounts = await offlineSigner.getAccounts();

        const client = await SigningStargateClient.connectWithSigner(
            rpcEndpoint,
            offlineSigner,
        );

        const amountInUatom = Math.floor(parseFloat(amount) * 1_000_000);
        const fee = {
            amount: [{
                denom: 'uatom',
                amount: '5000',
            }],
            gas: '200000',
        };

        const result = await client.sendTokens(
            accounts[0].address,
            recipientAddress,
            [{
                denom: 'uatom',
                amount: amountInUatom.toString(),
            }],
            fee,
            'Sent via Web3 Multi-Wallet'
        );

        return result.transactionHash;
    } catch (error: any) {
        throw new WalletConnectionError(error.message || 'Failed to send transaction');
    }
};

export const getLeapExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || CHAIN_EXPLORERS['cosmoshub-4'];
    return `${baseUrl}/txs/${txHash}`;
};