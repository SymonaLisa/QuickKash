import algosdk from 'algosdk';

export interface GroupTransactionResult {
  success: boolean;
  signedTxns?: Uint8Array[];
  error?: string;
}

export interface TipSplitParams {
  tipAmount: number; // in ALGO
  senderWallet: string;
  creatorWallet: string;
  platformWallet: string;
}

class GroupTransactionBuilder {
  private algodClient: algosdk.Algodv2;

  constructor() {
    // Using Nodely's mainnet API with token from environment variables
    const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D';
    
    this.algodClient = new algosdk.Algodv2(
      algodToken,
      'https://mainnet-api.4160.nodely.io',
      ''
    );
  }

  /**
   * Builds and signs a group transaction that splits a tip between creator (98%) and platform (2%)
   */
  async buildTipSplitTransaction(
    params: TipSplitParams,
    walletProvider: 'pera' | 'myalgo'
  ): Promise<GroupTransactionResult> {
    try {
      const { tipAmount, senderWallet, creatorWallet, platformWallet } = params;

      // Get suggested transaction parameters from mainnet
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Convert ALGO to microAlgos
      const totalMicroAlgos = Math.floor(tipAmount * 1e6);
      
      // Calculate split amounts (98% to creator, 2% to platform)
      const creatorAmount = Math.floor(totalMicroAlgos * 0.98);
      const platformAmount = totalMicroAlgos - creatorAmount; // Ensures exact total

      // Validate amounts
      if (creatorAmount < 1000 || platformAmount < 1000) {
        throw new Error('Tip amount too small - minimum 0.001 ALGO required');
      }

      // Create transaction to creator (98%)
      const creatorTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderWallet,
        to: creatorWallet,
        amount: creatorAmount,
        suggestedParams,
        note: new Uint8Array(Buffer.from('QuickKash Tip (98%)')),
      });

      // Create transaction to platform (2%)
      const platformTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderWallet,
        to: platformWallet,
        amount: platformAmount,
        suggestedParams,
        note: new Uint8Array(Buffer.from('QuickKash Platform Fee (2%)')),
      });

      // Group the transactions
      const txnGroup = [creatorTxn, platformTxn];
      const groupId = algosdk.computeGroupID(txnGroup);
      
      // Assign group ID to each transaction
      txnGroup.forEach(txn => {
        txn.group = groupId;
      });

      // Sign the transactions based on wallet provider
      const signedTxns = await this.signTransactionGroup(txnGroup, senderWallet, walletProvider);

      return {
        success: true,
        signedTxns
      };

    } catch (error) {
      console.error('Group transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction group creation failed'
      };
    }
  }

  /**
   * Signs a transaction group using the specified wallet provider
   */
  private async signTransactionGroup(
    txnGroup: algosdk.Transaction[],
    senderAddress: string,
    walletProvider: 'pera' | 'myalgo'
  ): Promise<Uint8Array[]> {
    if (walletProvider === 'pera') {
      // Import Pera Wallet for signing
      const { PeraWalletConnect } = await import('@perawallet/connect');
      const peraWallet = new PeraWalletConnect({ shouldShowSignTxnToast: false });

      // Prepare transactions for Pera Wallet
      const txnArray = txnGroup.map(txn => ({
        txn,
        signers: [senderAddress]
      }));

      const signedTxnArray = await peraWallet.signTransaction([txnArray]);
      return signedTxnArray;

    } else if (walletProvider === 'myalgo') {
      // @ts-ignore - MyAlgo is loaded via CDN
      if (!window.MyAlgoConnect) {
        throw new Error('MyAlgo Wallet not available');
      }

      // @ts-ignore
      const myAlgoWallet = new window.MyAlgoConnect();
      
      // Convert transactions to bytes for MyAlgo
      const txnBytes = txnGroup.map(txn => txn.toByte());
      const signedTxnArray = await myAlgoWallet.signTransaction(txnBytes);
      
      return signedTxnArray.map((signed: any) => signed.blob);

    } else {
      throw new Error('Unsupported wallet provider');
    }
  }

  /**
   * Submits signed transaction group to the network
   */
  async submitTransactionGroup(signedTxns: Uint8Array[]): Promise<{ success: boolean; txIds?: string[]; error?: string }> {
    try {
      // Submit the group transaction
      const { txId } = await this.algodClient.sendRawTransaction(signedTxns).do();
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);
      
      // Extract all transaction IDs from the group
      const txIds = await this.getGroupTransactionIds(txId);
      
      return {
        success: true,
        txIds
      };

    } catch (error) {
      console.error('Transaction submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction submission failed'
      };
    }
  }

  /**
   * Waits for transaction confirmation
   */
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

  /**
   * Gets all transaction IDs from a group transaction
   */
  private async getGroupTransactionIds(groupTxId: string): Promise<string[]> {
    try {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(groupTxId).do();
      const groupId = pendingInfo.txn.txn.grp;
      
      if (!groupId) {
        return [groupTxId];
      }

      // For now, return the main transaction ID
      // In a full implementation, you'd query the indexer for all group transactions
      return [groupTxId];
      
    } catch (error) {
      console.error('Failed to get group transaction IDs:', error);
      return [groupTxId];
    }
  }

  /**
   * Utility function to calculate split amounts
   */
  calculateSplitAmounts(tipAmountAlgo: number): { creatorAmount: number; platformAmount: number; totalMicroAlgos: number } {
    const totalMicroAlgos = Math.floor(tipAmountAlgo * 1e6);
    const creatorAmount = Math.floor(totalMicroAlgos * 0.98);
    const platformAmount = totalMicroAlgos - creatorAmount;
    
    return {
      creatorAmount,
      platformAmount,
      totalMicroAlgos
    };
  }

  /**
   * Formats microAlgos to ALGO for display
   */
  formatMicroAlgosToAlgo(microAlgos: number): string {
    return (microAlgos / 1e6).toFixed(6).replace(/\.?0+$/, '');
  }
}

export const groupTransactionBuilder = new GroupTransactionBuilder();

// Example usage function
export async function sendTipWithPlatformFee(
  tipAmount: number,
  senderWallet: string,
  creatorWallet: string,
  platformWallet: string,
  walletProvider: 'pera' | 'myalgo'
): Promise<{ success: boolean; txIds?: string[]; error?: string }> {
  
  // Build and sign the group transaction
  const groupResult = await groupTransactionBuilder.buildTipSplitTransaction({
    tipAmount,
    senderWallet,
    creatorWallet,
    platformWallet
  }, walletProvider);

  if (!groupResult.success || !groupResult.signedTxns) {
    return {
      success: false,
      error: groupResult.error
    };
  }

  // Submit the signed transactions
  const submitResult = await groupTransactionBuilder.submitTransactionGroup(groupResult.signedTxns);
  
  return submitResult;
}