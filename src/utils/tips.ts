import { supabase } from './supabase';

export async function logTip(wallet: string, amount: number) {
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
    console.log('Tip logged successfully:', data);
  }
}