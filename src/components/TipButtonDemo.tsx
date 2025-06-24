import React, { useState } from 'react';
import { TipButton } from './TipButton';
import { User, Settings, Sparkles } from 'lucide-react';

// Demo component showing different TipButton configurations
export const TipButtonDemo: React.FC = () => {
  const [lastTip, setLastTip] = useState<{ txId: string; amount: number } | null>(null);

  const handleTipSuccess = (txId: string, amount: number) => {
    setLastTip({ txId, amount });
    console.log('Tip successful!', { txId, amount });
  };

  const handleTipError = (error: string) => {
    console.error('Tip failed:', error);
  };

  // Example creator wallet addresses (replace with real ones)
  const EXAMPLE_CREATOR_WALLET = 'ALGORAND_WALLET_ADDRESS_58_CHARS_LONG_EXAMPLE_HERE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-3">TipButton Component Demo</h1>
          <p className="text-secondary">
            Showcase of different TipButton configurations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Tip Button */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-primary">Basic Tip Button</h3>
            </div>
            <p className="text-secondary text-sm mb-4">
              Standard tip button with amount input
            </p>
            <TipButton
              creatorWallet={EXAMPLE_CREATOR_WALLET}
              creatorName="Demo Creator"
              onTipSuccess={handleTipSuccess}
              onTipError={handleTipError}
            />
          </div>

          {/* Fixed Amount Button */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-primary">Fixed Amount</h3>
            </div>
            <p className="text-secondary text-sm mb-4">
              Pre-set tip amount (5 ALGO)
            </p>
            <TipButton
              creatorWallet={EXAMPLE_CREATOR_WALLET}
              creatorName="Demo Creator"
              fixedAmount={5}
              showAmountInput={false}
              onTipSuccess={handleTipSuccess}
              onTipError={handleTipError}
            />
          </div>

          {/* Premium Unlock Button */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-primary">Premium Unlock</h3>
            </div>
            <p className="text-secondary text-sm mb-4">
              10 ALGO tip to unlock premium content
            </p>
            <TipButton
              creatorWallet={EXAMPLE_CREATOR_WALLET}
              creatorName="Demo Creator"
              fixedAmount={10}
              showAmountInput={false}
              onTipSuccess={handleTipSuccess}
              onTipError={handleTipError}
            />
          </div>
        </div>

        {/* Last Tip Info */}
        {lastTip && (
          <div className="mt-8 glass-card p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Last Successful Tip</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-300 font-medium">
                ✅ Tip of {lastTip.amount} ALGO sent successfully!
              </p>
              <p className="text-emerald-200 text-sm mt-1">
                Transaction ID: {lastTip.txId}
              </p>
              <a
                href={`https://allo.info/tx/${lastTip.txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm underline mt-2 inline-block"
              >
                View on AlloInfo →
              </a>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Usage Instructions</h3>
          <div className="space-y-3 text-sm text-secondary">
            <p>
              <strong className="text-primary">1. Set Environment Variables:</strong> 
              Make sure your <code className="bg-slate-700 px-1 rounded">.env</code> file has:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="bg-slate-700 px-1 rounded">VITE_DEV_FEE_ADDRESS</code> - Your QuickKash wallet address</li>
              <li><code className="bg-slate-700 px-1 rounded">VITE_ALGOD_TOKEN</code> - Your Nodely API token</li>
            </ul>
            
            <p>
              <strong className="text-primary">2. Replace Creator Wallet:</strong> 
              Update <code className="bg-slate-700 px-1 rounded">EXAMPLE_CREATOR_WALLET</code> with real Algorand addresses
            </p>
            
            <p>
              <strong className="text-primary">3. Connect Pera Wallet:</strong> 
              Users need Pera Wallet installed and connected to send tips
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};