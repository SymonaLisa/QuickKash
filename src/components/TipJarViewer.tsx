import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Wallet, CheckCircle, AlertCircle, Loader2, User, Star, Gift, Download, Info } from 'lucide-react';
import { CreatorMetadata, localStorageManager } from '../utils/localStorage';
import { connectPera, signAndSendTipWithWallet } from '../utils/walletConnection';
import { supabaseManager } from '../utils/supabase';
import { TipHistory } from './TipHistory';
import { PremiumContentViewer } from './PremiumContentViewer';
import { QuickKashLogo } from './QuickKashLogo';
import algosdk from 'algosdk';

export const TipJarViewer: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [creator, setCreator] = useState<CreatorMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tipperAddress, setTipperAddress] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{ success: boolean; txId?: string; error?: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPremiumContent, setShowPremiumContent] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [tipNote, setTipNote] = useState('');
  const [showRewardScreen, setShowRewardScreen] = useState(false);

  const tipAmounts = [1, 5, 10, 25];

  // Initialize Algod client
  const algodClient = new algosdk.Algodv2(
    import.meta.env.VITE_ALGOD_TOKEN || '98D9CE80660AD243893D56D9F125CD2D',
    'https://mainnet-api.4160.nodely.io',
    ''
  );

  useEffect(() => {
    loadCreatorData();
  }, [walletAddress]);

  useEffect(() => {
    if (tipperAddress && walletAddress) {
      checkPremiumAccess();
    }
  }, [tipperAddress, walletAddress]);

  const loadCreatorData = async () => {
    if (!walletAddress) {
      setError('Invalid wallet address');
      setLoading(false);
      return;
    }

    try {
      const metadata = localStorageManager.getCreatorMetadata(`creator_${walletAddress}`);
      
      if (metadata) {
        setCreator(metadata);
      } else {
        setError('Creator not found');
      }
    } catch (err) {
      setError('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumAccess = async () => {
    if (!tipperAddress || !walletAddress) return;
    
    try {
      const hasAccess = await supabaseManager.checkPremiumAccess(tipperAddress, walletAddress);
      setHasPremiumAccess(hasAccess);
    } catch (error) {
      console.error('Failed to check premium access:', error);
    }
  };

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await connectPera();
      if (!address) {
        throw new Error('No wallet address received');
      }
      setTipperAddress(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendTip = async () => {
    if (!tipperAddress || !creator || !walletAddress) return;

    const finalAmount = selectedAmount === 0 ? parseFloat(customAmount) : selectedAmount;
    
    if (finalAmount <= 0) {
      setError('Please enter a valid tip amount');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const devFeeAddress = import.meta.env.VITE_DEV_FEE_ADDRESS || 'QUICKKASH_DEV_WALLET_ADDRESS_HERE';

      const txId = await signAndSendTipWithWallet({
        sender: tipperAddress,
        recipient: walletAddress,
        amountAlgo: finalAmount,
        devFeeAddress,
        algodClient,
        note: tipNote
      });

      setTransactionResult({ success: true, txId });
      
      // Record the tip in Supabase
      await supabaseManager.recordTip(
        tipperAddress,
        walletAddress,
        finalAmount,
        txId,
        tipNote
      );

      // Check if this unlocks premium access
      if (finalAmount >= 10) {
        setHasPremiumAccess(true);
        setShowRewardScreen(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      setTransactionResult({ success: false, error: errorMessage });
    } finally {
      setIsSending(false);
    }
  };

  const getEffectiveAmount = () => {
    return selectedAmount === 0 ? parseFloat(customAmount) || 0 : selectedAmount;
  };

  const calculateFees = (amount: number) => {
    const microAlgoAmount = algosdk.algosToMicroalgos(amount);
    const devFee = Math.floor(microAlgoAmount * 0.02);
    const creatorAmount = microAlgoAmount - devFee;
    
    return {
      total: amount,
      creator: algosdk.microalgosToAlgos(creatorAmount),
      platform: algosdk.microalgosToAlgos(devFee)
    };
  };

  const handleDownloadReward = () => {
    // Download the reward file from public/rewards folder
    const link = document.createElement('a');
    link.href = '/rewards/thank-you-reward.pdf';
    link.download = 'QuickKash-Thank-You-Reward.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-secondary">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-md w-full glass-card p-8 text-center relative z-10">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Creator Not Found</h1>
          <p className="text-secondary mb-4">{error}</p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-emerald-300 text-sm font-medium">
              🌐 Decentralized • No logins • No tracking • 100% yours
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showRewardScreen && transactionResult?.success) {
    const finalAmount = selectedAmount === 0 ? parseFloat(customAmount) : selectedAmount;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-md w-full glass-card p-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="accent-gradient rounded-2xl p-4 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            Thank You! 🎉
          </h1>
          <p className="text-secondary mb-6">
            Your {finalAmount} ALGO tip has been sent to {creator?.displayName}!
          </p>

          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-emerald-400 mr-2" />
              <span className="text-xl font-bold text-emerald-300">Premium Reward Unlocked!</span>
            </div>
            <p className="text-emerald-200 mb-4">
              As a thank you for your generous tip of 10+ ALGO, you've unlocked exclusive premium content!
            </p>
            
            <button
              onClick={handleDownloadReward}
              className="w-full flex items-center justify-center space-x-2 py-3 btn-primary"
            >
              <Download className="w-5 h-5" />
              <span>Download Your Reward</span>
            </button>
          </div>

          {transactionResult.txId && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
              <p className="text-sm text-muted mb-1">Transaction ID</p>
              <p className="text-xs font-mono text-slate-300 break-all">
                {transactionResult.txId}
              </p>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 btn-secondary mb-4"
          >
            Send Another Tip
          </button>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-emerald-300 text-sm font-medium">
              🌐 Decentralized • No logins • No tracking • 100% yours
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (transactionResult?.success && !showRewardScreen) {
    const finalAmount = selectedAmount === 0 ? parseFloat(customAmount) : selectedAmount;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-md w-full glass-card p-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="accent-gradient rounded-2xl p-4 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            Tip Sent! 🎉
          </h1>
          <p className="text-secondary mb-6">
            Your {finalAmount} ALGO tip has been successfully sent to {creator?.displayName}!
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-emerald-300 text-sm font-medium">
              💡 Note: A 2% platform fee was automatically deducted to support QuickKash development
            </p>
          </div>

          {transactionResult.txId && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
              <p className="text-sm text-muted mb-1">Transaction ID</p>
              <p className="text-xs font-mono text-slate-300 break-all">
                {transactionResult.txId}
              </p>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 btn-primary mb-4"
          >
            Send Another Tip
          </button>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-emerald-300 text-sm font-medium">
              🌐 Decentralized • No logins • No tracking • 100% yours
            </p>
          </div>
        </div>
      </div>
    );
  }

  const effectiveAmount = getEffectiveAmount();
  const fees = effectiveAmount > 0 ? calculateFees(effectiveAmount) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="grid gap-6">
          {/* Creator Profile & Tip Interface */}
          <div className="glass-card p-6 sm:p-8">
            {/* Creator Profile */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <QuickKashLogo size="medium" />
              </div>
              
              <div className="relative mb-6">
                {creator?.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 accent-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-primary mb-2">
                {creator?.displayName}
              </h1>
              <p className="text-secondary leading-relaxed mb-4">
                {creator?.bio}
              </p>
              
              {creator?.goal && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                  <p className="text-emerald-300 font-medium">🎯 {creator.goal}</p>
                </div>
              )}

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-emerald-300 text-sm font-medium">
                  🌐 Decentralized • No logins • No tracking • 100% yours
                </p>
              </div>

              {/* Premium Access Info */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="w-5 h-5 text-emerald-400 mr-2" />
                  <span className="font-semibold text-emerald-300">Unlock Premium Rewards!</span>
                </div>
                <div className="text-sm text-emerald-200 space-y-1">
                  <p>⭐ Tip 10+ ALGO → Get instant access to exclusive thank-you content</p>
                  <p>📁 Download premium rewards and bonus materials!</p>
                  <p>💡 2% platform fee supports QuickKash development</p>
                </div>
              </div>
            </div>

            {/* Tip Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary mb-3">
                Choose tip amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {tipAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-2 rounded-xl font-semibold transition-all duration-200 relative ${
                      selectedAmount === amount
                        ? 'accent-gradient text-white shadow-lg transform scale-105'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:scale-105'
                    }`}
                  >
                    {amount} ALGO
                    {amount >= 10 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">⭐</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  placeholder="Custom amount"
                  className="input-field flex-1"
                />
                <span className="text-muted font-medium">ALGO</span>
              </div>

              {/* Fee Breakdown */}
              {fees && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Transaction Breakdown</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">To Creator:</span>
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
                </div>
              )}
            </div>

            {/* Tip Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary mb-2">
                Add a message (optional)
              </label>
              <input
                type="text"
                value={tipNote}
                onChange={(e) => setTipNote(e.target.value)}
                placeholder="Thanks for the great content!"
                maxLength={100}
                className="input-field"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Wallet Connection / Tip Button */}
            {!tipperAddress ? (
              <div className="space-y-3">
                <button
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center space-x-2 py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Pera Wallet'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-emerald-300 text-sm">
                    ✓ Connected: {tipperAddress.slice(0, 8)}...{tipperAddress.slice(-8)}
                  </p>
                  {hasPremiumAccess && (
                    <p className="text-emerald-300 text-sm font-medium mt-1">
                      ⭐ Premium Access Unlocked
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleSendTip}
                  disabled={isSending || getEffectiveAmount() <= 0}
                  className="w-full flex items-center justify-center space-x-2 py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Tip...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        Tip {getEffectiveAmount()} ALGO 
                        {getEffectiveAmount() >= 10 ? ' ⭐' : ' 💸'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <p className="text-xs text-muted">
                  Tips are sent directly to the creator's wallet on Algorand (98% to creator, 2% platform fee)
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                  <button
                    onClick={() => setShowPremiumContent(!showPremiumContent)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {showPremiumContent ? 'Hide' : 'Show'} Premium
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Content */}
          {showPremiumContent && walletAddress && (
            <PremiumContentViewer 
              creatorAddress={walletAddress}
              tipperAddress={tipperAddress}
              hasAccess={hasPremiumAccess}
            />
          )}

          {/* Tip History */}
          {showHistory && walletAddress && (
            <TipHistory walletAddress={walletAddress} />
          )}
        </div>
      </div>
    </div>
  );
};