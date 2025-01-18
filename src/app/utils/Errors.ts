export class WalletConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WalletConnectionError";
    }
}

export class WalletNotInstalledError extends Error {
    constructor(message: string = "Wallet is not installed") { 
        super(message);
        this.name = "WalletNotInstalledError";
    }
}

export class TransactionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TransactionError";
    }
}
