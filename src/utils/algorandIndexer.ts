import algosdk from 'algosdk';

export interface TipTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number; // in ALGO
  note?: string;
  timestamp: string;
  roundTime: number;
}

export interface TipHistoryData {
  transactions: TipTransaction[];
  totalTipped: number;
  totalTransactions: number;
}

class AlgorandIndexerManager {
  private indexerClient: algosdk.Indexer;

  constructor() {
    // Using Nodely's indexer API with the official Algorand SDK
    const algodToken = '98D9CE80660AD243893D56D9F125CD2D';
    const indexerServer = 'https://mainnet-idx.4160.nodely.io';
    const algodPort = '';
    
    this.indexerClient = new algosdk.Indexer(algodToken, indexerServer, algodPort);
  }

  async getTipHistory(walletAddress: string, limit: number = 10): Promise<TipHistoryData> {
    try {
      // Fetch transactions where the wallet is the receiver
      const response = await this.indexerClient
        .lookupAccountTransactions(walletAddress)
        .txType('pay')
        .limit(limit)
        .do();

      const transactions: TipTransaction[] = [];
      let totalTipped = 0;

      // Process transactions
      for (const tx of response.transactions || []) {
        if (tx['tx-type'] === 'pay' && tx['payment-transaction']) {
          const paymentTx = tx['payment-transaction'];
          
          // Only include transactions where this wallet is the receiver
          if (paymentTx.receiver === walletAddress) {
            const amountInAlgo = paymentTx.amount / 1000000; // Convert microAlgos to ALGO
            totalTipped += amountInAlgo;

            // Decode note if present
            let note = '';
            if (tx.note) {
              try {
                note = Buffer.from(tx.note, 'base64').toString('utf-8');
              } catch (e) {
                note = '';
              }
            }

            transactions.push({
              id: tx.id,
              sender: paymentTx.sender,
              receiver: paymentTx.receiver,
              amount: amountInAlgo,
              note: note || undefined,
              timestamp: new Date(tx['round-time'] * 1000).toISOString(),
              roundTime: tx['round-time']
            });
          }
        }
      }

      // Sort by most recent first
      transactions.sort((a, b) => b.roundTime - a.roundTime);

      return {
        transactions: transactions.slice(0, limit),
        totalTipped,
        totalTransactions: transactions.length
      };
    } catch (error) {
      console.error('Failed to fetch tip history:', error);
      return {
        transactions: [],
        totalTipped: 0,
        totalTransactions: 0
      };
    }
  }

  async getTotalTipsReceived(walletAddress: string): Promise<number> {
    try {
      // Fetch all payment transactions to this address
      const response = await this.indexerClient
        .lookupAccountTransactions(walletAddress)
        .txType('pay')
        .limit(1000)
        .do();

      let totalTipped = 0;

      // Sum all incoming payments
      for (const tx of response.transactions || []) {
        if (tx['tx-type'] === 'pay' && tx['payment-transaction']) {
          const paymentTx = tx['payment-transaction'];
          
          if (paymentTx.receiver === walletAddress) {
            totalTipped += paymentTx.amount / 1000000; // Convert to ALGO
          }
        }
      }

      return totalTipped;
    } catch (error) {
      console.error('Failed to fetch total tips:', error);
      return 0;
    }
  }

  async getAccountAssets(walletAddress: string): Promise<any[]> {
    try {
      const accountInfo = await this.indexerClient.lookupAccountByID(walletAddress).do();
      return accountInfo.account.assets || [];
    } catch (error) {
      console.error('Failed to fetch account assets:', error);
      return [];
    }
  }

  async getAssetInfo(assetId: number): Promise<any> {
    try {
      const assetInfo = await this.indexerClient.lookupAssetByID(assetId).do();
      return assetInfo.asset;
    } catch (error) {
      console.error('Failed to fetch asset info:', error);
      return null;
    }
  }

  formatAlgoAmount(amount: number): string {
    return amount.toFixed(6).replace(/\.?0+$/, '');
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const indexerManager = new AlgorandIndexerManager();