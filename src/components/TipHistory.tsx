import React, { useState, useEffect } from 'react';
import { Clock, User, MessageCircle, ExternalLink, Loader2, TrendingUp } from 'lucide-react';
import { indexerManager, TipHistoryData, TipTransaction } from '../utils/algorandIndexer';

interface TipHistoryProps {
  walletAddress: string;
}

export const TipHistory: React.FC<TipHistoryProps> = ({ walletAddress }) => {
  const [tipHistory, setTipHistory] = useState<TipHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTipHistory();
  }, [walletAddress]);

  const loadTipHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const history = await indexerManager.getTipHistory(walletAddress, 10);
      setTipHistory(history);
    } catch (err) {
      setError('Failed to load tip history');
      console.error('Tip history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTransaction = (txId: string) => {
    window.open(`https://allo.info/tx/${txId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-secondary">Loading tip history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadTipHistory}
            className="mt-3 px-4 py-2 btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center">
          <Clock className="w-5 h-5 mr-2 text-emerald-500" />
          Recent Tips
        </h3>
        {tipHistory && tipHistory.totalTipped > 0 && (
          <div className="text-right">
            <div className="flex items-center text-emerald-400 font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" />
              {indexerManager.formatAlgoAmount(tipHistory.totalTipped)} ALGO
            </div>
            <p className="text-xs text-muted">Total received</p>
          </div>
        )}
      </div>

      {!tipHistory || tipHistory.transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-secondary mb-2">No tips received yet</p>
          <p className="text-sm text-muted">Tips will appear here once received</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tipHistory.transactions.map((tx: TipTransaction) => (
            <div
              key={tx.id}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-sm"
              onClick={() => openTransaction(tx.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">
                        {tx.sender.slice(0, 8)}...{tx.sender.slice(-6)}
                      </p>
                      <p className="text-xs text-muted">
                        {indexerManager.formatTimestamp(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {tx.note && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-2 backdrop-blur-sm">
                      <p className="text-sm text-emerald-300 italic">"{tx.note}"</p>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-emerald-400">
                      +{indexerManager.formatAlgoAmount(tx.amount)} ALGO
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {tipHistory.totalTransactions > 10 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted">
                Showing latest 10 of {tipHistory.totalTransactions} tips
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};