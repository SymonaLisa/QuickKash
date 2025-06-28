import { PeraWalletConnect } from '@perawallet/connect';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import algosdk from 'algosdk';
import { Buffer } from 'buffer';  // Added for browser Buffer support

// Polyfill Buffer globally for browser (if needed)
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

export interface WalletConnection {
  address: string;
  provider: string;
}

class WalletManager {
  private peraWallet: PeraWalletConnect;
  private myAlgoWallet: MyAlgoConnect;
  private algodClient: algosdk.Algodv2;

  constructor() {
    this.peraWallet = new PeraWalletConnect({ shouldShowSignTxnToast: false });
    this.myAlgoWallet = new MyAlgoConnect();

    const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D';
    this.algodClient = new algosdk.Algodv2(algodToken, 'https://mainnet-api.4160.nodely.io', '');
  }

  async connectPera(): Promise<WalletConnection> {
    try {
      const accounts = await this.peraWallet.connect();
      if (accounts.length === 0) throw new Error('No accounts found');
      return { address: accounts[0], provider: 'Pera Wallet' };
    } catch (error: any) {
      console.error('Pera wallet connection failed:', error);
      throw new Error('Failed to connect to Pera Wallet');
    }
  }

  async connectMyAlgo(): Promise<WalletConnection> {
    try {
      const accounts = await this.myAlgoWallet.connect();
      if (accounts.length === 0) throw new Error('No accounts found in MyAlgo Wallet');
      return { address: accounts[0].address, provider: 'MyAlgo Wallet' };
    } catch (error: any) {
      console.error('MyAlgo wallet connection failed:', error);
      
      // Convert error to string at the beginning for reliable string operations
      const errorString = String(error?.message || error || 'Unknown error');
      
      if (errorString.includes('User rejected')) {
        throw new Error('Connection cancelled by user');
      }
      if (errorString.includes('not available')) {
        throw new Error('MyAlgo Wallet is not available. Check your internet connection and try again.');
      }
      if (errorString.includes('blocked')) {
        throw new Error('MyAlgo Wallet connection was blocked. Please check your browser settings and try again.');
      }
      
      throw new Error(`MyAlgo connection failed: ${errorString}`);
    }
  }

  disconnectPera(): void {
    this.peraWallet.disconnect();
  }

  isMyAlgoAvailable(): boolean {
    return typeof window !== 'undefined' && !!window?.MyAlgoWallet;
  }

  isPeraAvailable(): boolean {
    return typeof window !== 'undefined' && !!window?.pera;
  }

  getMyAlgoInstance(): MyAlgoConnect {
    return this.myAlgoWallet;
  }

  getPeraInstance(): PeraWalletConnect {
    return this.peraWallet;
  }

  getAlgodClient(): algosdk.Algodv2 {
    return this.algodClient;
  }
}

export const walletManager = new WalletManager();

export const connectPera = async (): Promise<string | null> => {
  try {
    const connection = await walletManager.connectPera();
    return connection.address;
  } catch (err) {
    console.error('Pera Wallet connection failed:', err);
    return null;
  }
};

export const disconnectPera = async () => {
  walletManager.disconnectPera();
};

export const signAndSendTip = async ({
  sender,
  recipient,
  amountAlgo,
  devFeeAddress = 'YOUR_REAL_QUICKKASH_DEV_WALLET_ADDRESS_HERE', // <-- Replace with your real dev wallet address
  algodClient,
}: {
  sender: string;
  recipient: string;
  amountAlgo: number;
  devFeeAddress?: string;
  algodClient?: algosdk.Algodv2;
}) => {
  const client = algodClient || walletManager.getAlgodClient();

  try {
    const params = await client.getTransactionParams().do();

    const microAlgoAmount = algosdk.algosToMicroalgos(amountAlgo);
    const devFee = Math.floor(microAlgoAmount * 0.02);
    const creatorAmount = microAlgoAmount - devFee;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: recipient,
      amount: creatorAmount,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from('QuickKash Tip (98%)')),
    });

    const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: devFeeAddress,
      amount: devFee,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from('QuickKash Platform Fee (2%)')),
    });

    const groupId = algosdk.computeGroupID([txn1, txn2]);
    txn1.group = groupId;
    txn2.group = groupId;

    const peraWallet = walletManager.getPeraInstance();
    const signedTxns = await peraWallet.signTransaction([
      { txn: txn1, signers: [sender] },
      { txn: txn2, signers: [sender] },
    ]);

    const { txId } = await client.sendRawTransaction(signedTxns).do();

    await algosdk.waitForConfirmation(client, txId, 4);
    return txId;
  } catch (error: any) {
    console.error('Failed to sign and send tip transaction:', error);
    throw error;
  }
};

export const signAndSendTipWithWallet = async ({
  sender,
  recipient,
  amountAlgo,
  devFeeAddress = 'YOUR_REAL_QUICKKASH_DEV_WALLET_ADDRESS_HERE', // <-- Replace with your real dev wallet address
  walletType = 'pera',
  algodClient,
  note,
}: {
  sender: string;
  recipient: string;
  amountAlgo: number;
  devFeeAddress?: string;
  walletType?: 'pera' | 'myalgo';
  algodClient?: algosdk.Algodv2;
  note?: string;
}) => {
  const client = algodClient || walletManager.getAlgodClient();

  try {
    const params = await client.getTransactionParams().do();

    const microAlgoAmount = algosdk.algosToMicroalgos(amountAlgo);
    const devFee = Math.floor(microAlgoAmount * 0.02);
    const creatorAmount = microAlgoAmount - devFee;

    const noteText = note ? `QuickKash: ${note}` : 'QuickKash Tip';
    const devNoteText = 'QuickKash Platform Fee (2%)';

    const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: recipient,
      amount: creatorAmount,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from(noteText)),
    });

    const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: devFeeAddress,
      amount: devFee,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from(devNoteText)),
    });

    const groupId = algosdk.computeGroupID([txn1, txn2]);
    txn1.group = groupId;
    txn2.group = groupId;

    let signedTxns;

    if (walletType === 'pera') {
      const peraWallet = walletManager.getPeraInstance();
      signedTxns = await peraWallet.signTransaction([
        { txn: txn1, signers: [sender] },
        { txn: txn2, signers: [sender] },
      ]);
    } else if (walletType === 'myalgo') {
      const myAlgoWallet = walletManager.getMyAlgoInstance();
      const txnBytes = [txn1.toByte(), txn2.toByte()];
      const signedTxnArray = await myAlgoWallet.signTransaction(txnBytes);
      signedTxns = signedTxnArray.map((signed: any) => signed.blob);
    } else {
      throw new Error('Unsupported wallet type');
    }

    const { txId } = await client.sendRawTransaction(signedTxns).do();

    await algosdk.waitForConfirmation(client, txId, 4);

    return txId;
  } catch (error: any) {
    console.error('Failed to sign and send tip with wallet:', error);
    throw error;
  }
};