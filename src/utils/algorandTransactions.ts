import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

export interface TransactionResult {
  success: boolean;
  txId?: string;
  error?: string;
}

class AlgorandTransactionManager {
  private algodClient: algosdk.Algodv2;
  private peraWallet: PeraWalletConnect;

  constructor() {
    // Using Nodely's API with the token from environment variables
    const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D';
    
    this.algodClient = new algosdk.Algodv2(
      algodToken,
      'https://mainnet-api.4160.nodely.io',
      ''
    );
    
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
  }

  async sendAlgoTip(
    fromAddress: string,
    toAddress: string,
    amount: number,
    walletProvider: string,
    note?: string
  ): Promise<TransactionResult> {
    try {
      // Get suggested transaction parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
      const amountInMicroAlgos = amount * 1000000;
      
      // Create note with QuickKash prefix
      const noteText = note ? `QuickKash: ${note}` : 'QuickKash Tip';
      
      // Create the transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: fromAddress,
        to: toAddress,
        amount: amountInMicroAlgos,
        suggestedParams,
        note: new Uint8Array(Buffer.from(noteText)),
      });

      let signedTxn;
      
      if (walletProvider === 'Pera Wallet') {
        // Sign with Pera Wallet
        const txnArray = [{ txn, signers: [fromAddress] }];
        const signedTxnArray = await this.peraWallet.signTransaction([txnArray]);
        signedTxn = signedTxnArray[0];
      } else if (walletProvider === 'MyAlgo Wallet') {
        // Check if MyAlgo is available
        if (!window.MyAlgoConnect) {
          throw new Error('MyAlgo Wallet is not available. Please use Pera Wallet instead.');
        }
        
        // Sign with MyAlgo
        // @ts-ignore
        const myAlgoWallet = new window.MyAlgoConnect();
        const signedTxnArray = await myAlgoWallet.signTransaction(txn.toByte());
        signedTxn = signedTxnArray.blob;
      } else {
        throw new Error('Unsupported wallet provider');
      }

      // Submit the transaction
      const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);
      
      return {
        success: true,
        txId
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          return {
            success: false,
            error: 'Transaction cancelled by user'
          };
        } else if (error.message.includes('insufficient funds')) {
          return {
            success: false,
            error: 'Insufficient ALGO balance for this transaction'
          };
        } else if (error.message.includes('MyAlgo')) {
          return {
            success: false,
            error: 'MyAlgo Wallet connection issue. Please try using Pera Wallet instead.'
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  private async waitForConfirmation(txId: string): Promise<void> {
    let lastRound = (await this.algodClient.status().do())['last-round'];
    
    while (true) {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do();
      
      if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
        break;
      }
      
      lastRound++;
      await this.algodClient.statusAfterBlock(lastRound).do();
    }
  }

  async connectWallet(walletType: 'pera' | 'myalgo'): Promise<string> {
    if (walletType === 'pera') {
      const accounts = await this.peraWallet.connect();
      return accounts[0];
    } else {
      // Check if MyAlgo is available
      if (!window.MyAlgoConnect) {
        throw new Error('MyAlgo Wallet is not available. Please use Pera Wallet instead.');
      }
      
      // @ts-ignore
      const myAlgoWallet = new window.MyAlgoConnect();
      const accounts = await myAlgoWallet.connect();
      return accounts[0].address;
    }
  }
}

export const transactionManager = new AlgorandTransactionManager();