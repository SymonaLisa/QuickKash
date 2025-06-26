import algosdk from 'algosdk';
import { walletManager, signAndSendTipWithWallet } from './walletConnection';

export interface TransactionResult {
  success: boolean;
  txId?: string;
  error?: string;
}

class AlgorandTransactionManager {
  private algodClient: algosdk.Algodv2;

  constructor() {
    // Using Nodely's API with the token from environment variables
    const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D';

    this.algodClient = new algosdk.Algodv2(
      algodToken,
      'https://mainnet-api.4160.nodely.io',
      ''
    );
  }

  async sendAlgoTip(
    fromAddress: string,
    toAddress: string,
    amount: number,
    walletProvider: string,
    note?: string
  ): Promise<TransactionResult> {
    try {
      // Use the new grouped transaction approach with dev fee
      const devFeeAddress = import.meta.env.VITE_DEV_FEE_ADDRESS || 'QUICKKASH_DEV_WALLET_ADDRESS_HERE';

      const walletType = walletProvider.toLowerCase() === 'pera wallet' ? 'pera' : 'myalgo';

      const txId = await signAndSendTipWithWallet({
        sender: fromAddress,
        recipient: toAddress,
        amountAlgo: amount,
        devFeeAddress,
        walletType,
        algodClient: this.algodClient,
        note
      });

      return {
        success: true,
        txId
      };
    } catch (error) {
      console.error('Transaction failed:', error);

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('user rejected') || msg.includes('cancelled')) {
          return {
            success: false,
            error: 'Transaction cancelled by user'
          };
        } else if (msg.includes('insufficient funds')) {
          return {
            success: false,
            error: 'Insufficient ALGO balance for this transaction'
          };
        } else if (msg.includes('myalgo')) {
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

  async connectWallet(walletType: 'pera' | 'myalgo'): Promise<string> {
    if (walletType === 'pera') {
      const connection = await walletManager.connectPera();
      return connection.address;
    } else {
      const connection = await walletManager.connectMyAlgo();
      return connection.address;
    }
  }

  // Legacy method for backward compatibility (optional to keep)
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
}

export const transactionManager = new AlgorandTransactionManager();

