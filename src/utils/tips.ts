import { supabase } from './supabase';

export interface TipLogData {
  wallet: string;
  amount: number;
  tx_id: string;
  creator_address?: string;
  note?: string;
}

export const logTip = async ({
  wallet,
  amount,
  tx_id,
  creator_address,
  note
}: TipLogData) => {
  try {
    const { data, error } = await supabase.from('tips').insert({
      tipper_address: wallet,
      creator_address: creator_address || wallet, // Use wallet as creator if not specified
      amount,
      transaction_id: tx_id,
      note,
      premium_unlocked: amount >= 10,
      timestamp: new Date().toISOString()
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

// Legacy function for backward compatibility
export const logTipSimple = async (wallet: string, amount: number) => {
  const { data, error } = await supabase.from('tips').insert([
    { 
      creator_address: wallet,
      tipper_address: 'anonymous', // Default for simple logging
      amount: amount,
      transaction_id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      premium_unlocked: amount >= 10,
      timestamp: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('Error logging tip:', error);
  } else {
    console.log('Tip logged:', data);
  }
};