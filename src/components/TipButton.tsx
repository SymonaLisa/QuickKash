import React, { useState } from 'react';
import { Wallet, Loader2, CheckCircle, AlertTriangle, Info, Star } from 'lucide-react';
import algosdk from 'algosdk';
import { connectPera, signAndSendTip } from '../utils/walletConnection';
import { supabaseManager } from '../utils/supabase';

interface TipButtonProps {
  creatorWallet: string;
  creatorName?: string;
  defaultAmount?: number;
  onTipSuccess?: (txId: string, amount: number) => void;
  onTipError?: (error: string) => void;
  className?: string;
  showAmountInput?: boolean;
  fixedAmount?: number;
}

const algodClient = new algosdk.Algodv2(
  import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D',
  'https://mainnet-api.4160.nodely.io',
  ''
);

const DEV_WALLET = import.meta.env.VITE_DEV_FEE_ADDRESS || 'QUICKKASH_DEV_WALLET_ADDRESS_HERE';

export const TipButton: React.FC<TipButtonProps> = ({
  creatorWallet,
  creatorName = 'Creator',
  defaultAmount = 1,
  onTipSuccess,
  onTipError,
  className = '',
  showAmountInput = true,
  fixedAmount,
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(fixedAmount || defaultAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const finalAmount = fixedAmount ?? amount;

  const calculateFees = (tipAmount: number) => {
    const microAlgoAmount = algosdk.algosToMicroalgos(tipAmount);
    const devFee = Math.floor(microAlgoAmount * 0.02);
    const creatorAmount = microAlgoAmount - devFee;

    return {
      total: tipAmount,
      creator: algosdk.microalgosToAlgos(creatorAmount),
      platform: algosdk.microalgosToAlgos(devFee),
    };
  };

  const handleTip = async () => {
    setIsLoading(true);
    setStatus('Connecting wallet...');
    setTxId(null);

    try {
      const sender = await connectPera();
      if (!sender) throw new Error('Wallet connection failed');

      setConnectedWallet(sender);
      setStatus('Sending transaction...');

      const transactionId = await signAndSendTip({
        sender,
        recipient: creatorWallet,
        amountAlgo: finalAmount,
        devFeeAddress: DEV_WALLET,
        algodClient,
      });

      setTxId(transactionId);
      setStatus('Logging to Supabase...');

      await supabaseManager.recordTip(sender, creatorWallet, finalAmount, transactionId, `Tip to ${creatorName}`);

      if (finalAmount >= 10) {
        setStatus('Thank you! Premium content unlocked! 🎉');
      } else {
        setStatus('Thanks for your support! 💚');
      }

      onTipSuccess?.(transactionId, finalAmount);
    } catch (err: any) {
      console.error('Tip failed:', err);
      const errorMessage = err?.message || 'Error sending tip';
      setStatus(`Error: ${errorMessage}`);
      onTipError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fees = calculateFees(finalAmount);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Amount Input */}
      {showAmountInput && fixedAmount === undefined && (
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Tip Amount (ALGO)</label>
          <input
            type="number"
            value={amount}
            min={0.1}
            step={0.1}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input-field"
            placeholder="Enter ALGO amount"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Fee Breakdown */}
      {finalAmount > 0 && (
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Transaction Breakdown</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">To {creatorName}:</span>
              <span className="text-emerald-400 font-medium">{fees.creator.toFixed(6)} ALGO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Platform Fee (2%):</span>
              <span className="text-slate-400">{fees.platform.toFixed(6)} ALGO</span>
            </div>
            <div className="border-t border-slate-600 pt-1 mt-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">Total:</span>
                <span className="text-slate-300">{fees.total.toFixed(6)} ALGO</span>
              </div>
            </div>
          </div>

          {finalAmount >= 10 && (
            <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center space-x-1 text-emerald-300 text-xs font-medium">
                <Star className="w-3 h-3" />
                <span>Premium content will be unlocked!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connected Wallet Info */}
      {connectedWallet && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-emerald-300 text-sm font-medium">
            ✓ Connected: {connectedWallet.slice(0, 8)}...{connectedWallet.slice(-8)}
          </p>
        </div>
      )}

      {/* Tip Button */}
      <button
        onClick={handleTip}
        disabled={isLoading || finalAmount <= 0}
        className="w-full flex items-center justify-center space-x-2 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        aria-label={`Tip ${finalAmount.toFixed(2)} ALGO with Pera Wallet`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>
              Tip {finalAmount.toFixed(2)} ALGO with Pera Wallet
              {finalAmount >= 10 ? ' ⭐' : ' 💸'}
            </span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {status && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            status.includes('Error')
              ? 'bg-red-500/10 border border-red-500/20 text-red-300'
              : status.includes('Thank you') || status.includes('Thanks')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-2">
            {status.includes('Error') ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : status.includes('Thank you') || status.includes('Thanks') ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin" />
            )}
            <span>{status}</span>
          </div>
        </div>
      )}

      {/* Transaction ID */}
      {txId && (
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-xs text-muted mb-1">Transaction ID:</p>
          <p className="text-xs font-mono text-slate-300 break-all">{txId}</p>
          <a
            href={`https://allo.info/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 text-xs underline mt-1 inline-block"
          >
            View on AlloInfo →
          </a>
        </div>
      )}

      {/* Platform Fee Notice */}
      <div className="text-center">
        <p className="text-xs text-muted">2% platform fee supports QuickKash development</p>
      </div>
    </div>
  );
};
