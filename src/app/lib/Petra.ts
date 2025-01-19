import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { WalletNotInstalledError, WalletConnectionError } from '../utils/Errors';

interface WalletInfo {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

declare global {
    interface Window {
        aptos?: any; 
    }
}

const APTOS_CHAIN_NAMES: { [key: string]: string } = {
    '1': 'Aptos Mainnet',
    '2': 'Aptos Testnet',
    '3': 'Aptos Devnet',
};

const APTOS_CHAIN_EXPLORERS: { [key: string]: string } = {
    '1': 'https://explorer.aptoslabs.com',
    '2': 'https://explorer.aptoslabs.com',
    '3': 'https://explorer.aptoslabs.com',
};


type Coin = { coin: { value: string } };

export const connectPetra = async (): Promise<WalletInfo> => {
    try {
        if (!window.aptos) {
            throw new WalletNotInstalledError('Aptos wallet is not installed.');
        }

        await window.aptos.connect();
        const account = await window.aptos.account();
        
        const address = account?.address;
        if (!address) {
            throw new WalletConnectionError('Failed to get account address');
        }

        const chainId = '2';
        const chainName = APTOS_CHAIN_NAMES[chainId] || 'Unknown Network';

        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);

        const resource = await aptos.getAccountResource<Coin>({
            accountAddress: address,
            resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        });

        const coinValue = resource.coin.value;
        let balance = '0';
        if (coinValue) {
            try {
                const rawBalance = BigInt(coinValue);
                balance = (Number(rawBalance) / 1e8).toString(); 
            } catch {
                throw new WalletConnectionError('Failed to parse balance value');
            }
        }

        return {
            address,
            balance,
            chainId,
            chainName,
        };
    } catch (error: any) {
        console.error('Connection error:', error);
        if (error instanceof WalletNotInstalledError) {
            throw error;
        }
        throw new WalletConnectionError(error.message || 'Failed to connect to Aptos wallet');
    }
};


const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export const sendPetraTransaction = async (
    recipientAddress: string,
    amount: string
): Promise<string> => {
    try {
        if (!window.aptos) {
            throw new WalletNotInstalledError('Aptos wallet is not installed.');
        }

        const amountInMicroApt = (parseFloat(amount) * 1e8).toString();
        if (isNaN(parseFloat(amountInMicroApt))) {
            throw new WalletConnectionError('Invalid amount format.');
        }

        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);

        const sender = await window.aptos.account();

        const payload = {
            function: "0x1::coin::transfer",
            type_arguments: [APTOS_COIN],
            arguments: [recipientAddress, amountInMicroApt],
        };

        const pendingTxn = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });

        return pendingTxn.hash;
    } catch (error: any) {
        throw new WalletConnectionError(error.message || 'Failed to send Aptos transaction');
    }
};


export const getPetraExplorerUrl = (chainId: string, txHash: string): string => {
    const baseUrl = APTOS_CHAIN_EXPLORERS[chainId] || APTOS_CHAIN_EXPLORERS['2']; 
    const network = chainId === '1' ? '' : `?network=${chainId === '2' ? 'testnet' : 'devnet'}`;
    const url = `${baseUrl}/txn/${txHash}${network}`;
    return url;
};
