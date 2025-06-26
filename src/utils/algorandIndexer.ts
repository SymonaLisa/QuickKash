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
    // Using Nodely's indexer API with the token from environment variables
    const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D';
    const indexerServer = 'https://mainnet-idx.4160.nodely.io';
    const algodPort = '';
    
    this.indexerClient = new algosdk.Indexer(algodToken, indexerServer, algodPort);
  }

  // Updated getTipHistory with pagination to handle >1000 transactions reliably
  async getTipHistory(walletAddress: string, limit: number = 10): Promise<TipHistoryData> {
    try {
      const transactions: TipTransaction[] = [];
      let totalTipped = 0;
      let nextToken: string | undefined = undefined;

      while (transactions.length < limit) {
        const pageSize = Math.min(100, limit - transactions.length);
        let request = this.indexerClient
          .lookupAccountTransactions(walletAddress)
          .txType('pay')
          .limit(pageSize);

        if (nextToken) {
          request = request.nextToken(nextToken);
        }

        const response = await request.do();

        for (const tx of response.transactions || []) {
          if (tx['tx-type'] === 'pay' && tx['payment-transaction']) {
            const paymentTx = tx['payment-transaction'];

            if (paymentTx.receiver === walletAddress) {
              const amountInAlgo = paymentTx.amount / 1_000_000;
              totalTipped += amountInAlgo;

              let note = '';
              if (tx.note) {
                try {
                  note = Buffer.from(tx.note, 'base64').toString('utf-8');
                } catch {
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

        nextToken = response['next-token'];
        if (!nextToken) break; // no more pages
      }

      // Sort most recent first
      transactions.sort((a, b) => b.roundTime - a.roundTime);

      return {
        transactions,
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

  // Optional: Update getTotalTipsReceived to paginate through all transactions
  async getTotalTipsReceived(walletAddress: string): Promise<number> {
    try {
      let totalTipped = 0;
      let nextToken: string | undefined = undefined;

      do {
        let request = this.indexerClient
          .lookupAccountTransactions(walletAddress)
          .txType('pay')
          .limit(1000);

        if (nextToken) {
          request = request.nextToken(nextToken);
        }

        const response = await request.do();

        for (const tx of response.transactions || []) {
          if (tx['tx-type'] === 'pay' && tx['payment-transaction']) {
            const paymentTx = tx['payment-transaction'];
            if (paymentTx.receiver === walletAddress) {
              totalTipped += paymentTx.amount / 1_000_000;
            }
          }
        }

        nextToken = response['next-token'];
      } while (nextToken);

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
