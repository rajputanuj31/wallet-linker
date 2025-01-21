import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { GasPrice } from '@cosmjs/stargate';

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
    'osmo-test-5': 'Osmosis Testnet',
};

const CHAIN_RPCS: { [key: string]: string } = {
    'cosmoshub-4': 'https://cosmos-rpc.publicnode.com',
    'osmosis-1': 'https://osmosis-rpc.publicnode.com',
    'juno-1': 'https://juno-rpc.publicnode.com',
    'osmo-test-5': 'https://rpc.testnet.osmosis.zone:443',
};

const CHAIN_EXPLORERS: { [key: string]: string } = {
    'cosmoshub-4': 'https://www.mintscan.io/cosmos',
    'osmo-test-5': 'https://www.mintscan.io/osmosis-testnet',
    'juno-1': 'https://www.mintscan.io/juno',
};

export const connectLeap = async (chainId: string = 'osmo-test-5'): Promise<WalletInfo> => {
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
        console.log("All balances:", balance);

        const osmoBalance = balance.find((b) => b.denom === 'uosmo');
        const mainBalance = osmoBalance ? 
            (parseInt(osmoBalance.amount) / 1_000_000).toFixed(6) : 
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

export const sendLeapTransaction = async (recipientAddress: string, amount: string, chainId: string): Promise<string> => {
    try {
        if (!window.leap) {
            throw new WalletNotInstalledError('Leap wallet is not installed');
        }

        await window.leap.enable(chainId);
        const offlineSigner = await window.leap.getOfflineSignerAuto(chainId);
        
        const accounts = await offlineSigner.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const rpcEndpoint = CHAIN_RPCS[chainId];
        if (!rpcEndpoint) {
            throw new Error('Unsupported chain');
        }

        const client = await SigningStargateClient.connectWithSigner(
            rpcEndpoint,
            offlineSigner,
            {
                gasPrice: GasPrice.fromString('0.025uosmo')
            }
        );

        const balance = await client.getBalance(accounts[0].address, 'uosmo');
        if (!balance || balance.amount === '0') {
            throw new Error('Account has no funds. Please fund your account first.');
        }

        const amountInUosmo = Math.floor(parseFloat(amount) * 1_000_000);

        if (BigInt(balance.amount) < BigInt(amountInUosmo) + BigInt(5000)) {
            throw new Error('Insufficient funds for transaction and gas fees');
        }

        const result = await client.sendTokens(
            accounts[0].address,
            recipientAddress,
            [{
                denom: 'uosmo',
                amount: amountInUosmo.toString(),
            }],
            {
                amount: [{ denom: 'uosmo', amount: '5000' }],
                gas: '200000',
            },
            'Sent via Wallet Linker'
        );

        return result.transactionHash;
    } catch (error: any) {
        console.error('Leap transaction error:', error);
        if (error.message.includes('does not exist on chain')) {
            throw new WalletConnectionError('Account not initialized. Please fund your account first.');
        }
        throw new WalletConnectionError(error.message || 'Failed to send transaction');
    }
};

export const getLeapExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = CHAIN_EXPLORERS[chainId] || CHAIN_EXPLORERS['cosmoshub-4'];
    return `${baseUrl}/txs/${txHash}`;
};