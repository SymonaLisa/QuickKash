import algosdk from 'algosdk';
import { walletManager } from './walletConnection';

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
    params: TipSplitParams
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

      // Validate amounts (minimum fee + minimum transfer amount)
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
      txnGroup.forEach(txn => {
        txn.group = groupId;
      });

      // Sign the transactions using Pera Wallet
      const signedTxns = await this.signTransactionGroup(txnGroup, senderWallet);

      return {
        success: true,
        signedTxns,
      };
    } catch (error) {
      console.error('Group transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction group creation failed',
      };
    }
  }

  /**
   * Signs a transaction group using Pera Wallet
   */
  private async signTransactionGroup(
    txnGroup: algosdk.Transaction[],
    senderAddress: string
  ): Promise<Uint8Array[]> {
    const peraWallet = walletManager.getPeraInstance();

    // Prepare transactions for Pera Wallet
    const txnArray = txnGroup.map(txn => ({
      txn: txn.toByte(),
      signers: [senderAddress],
    }));

    const signedTxnArray = await peraWallet.signTransaction(txnArray);
    // peraWallet.signTransaction returns array of { id, blob } objects
    return signedTxnArray.map(txn => txn.blob);
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

      // Return the group transaction ID
      // For full group tx IDs, you'd query the indexer by group ID (not implemented here)
      return {
        success: true,
        txIds: [txId],
      };
    } catch (error) {
      console.error('Transaction submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction submission failed',
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
   * Utility function to calculate split amounts
   */
  calculateSplitAmounts(tipAmountAlgo: number): { creatorAmount: number; platformAmount: number; totalMicroAlgos: number } {
    const totalMicroAlgos = Math.floor(tipAmountAlgo * 1e6);
    const creatorAmount = Math.floor(totalMicroAlgos * 0.98);
    const platformAmount = totalMicroAlgos - creatorAmount;

    return {
      creatorAmount,
      platformAmount,
      totalMicroAlgos,
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

/**
 * Example usage function to send tip with platform fee split
 */
export async function sendTipWithPlatformFee(
  tipAmount: number,
  senderWallet: string,
  creatorWallet: string,
  platformWallet: string
): Promise<{ success: boolean; txIds?: string[]; error?: string }> {
  // Build and sign the group transaction
  const groupResult = await groupTransactionBuilder.buildTipSplitTransaction({
    tipAmount,
    senderWallet,
    creatorWallet,
    platformWallet,
  });

  if (!groupResult.success || !groupResult.signedTxns) {
    return {
      success: false,
      error: groupResult.error,
    };
  }

  // Submit the signed transactions
  const submitResult = await groupTransactionBuilder.submitTransactionGroup(groupResult.signedTxns);

  return submitResult;
}