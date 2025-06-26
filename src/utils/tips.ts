import { supabase } from './supabase';

export interface TipLogData {
  wallet: string;
  amount: number;
  tx_id: string;
  creator_address?: string;
  note?: string;
}

export interface LogTipResult {
  success: boolean;
  data?: any;
  error?: any;
}

export const logTip = async ({
  wallet,
  amount,
  tx_id,
  creator_address,
  note,
}: TipLogData): Promise<LogTipResult> => {
  try {
    const { data, error } = await supabase.from('tips').insert({
      tipper_address: wallet,
      creator_address: creator_address || wallet, // fallback creator address
      amount,
      transaction_id: tx_id,
      note,
      premium_unlocked: amount >= 10,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log tip:', error.message);
      throw error;
    }

    console.log('Tip logged successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error logging tip:', error);
    return { success: false, error };
  }
};

// Legacy simple logger for backward compatibility
export const logTipSimple = async (wallet: string, amount: number): Promise<void> => {
  const { data, error } = await supabase.from('tips').insert([
    {
      creator_address: wallet,
      tipper_address: 'anonymous',
      amount,
      transaction_id: `tip_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, // substring instead of substr
      premium_unlocked: amount >= 10,
      timestamp: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Error logging tip:', error);
  } else {
    console.log('Tip logged:', data);
  }
};
