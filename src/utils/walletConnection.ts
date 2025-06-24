import { PeraWalletConnect } from '@perawallet/connect';
import MyAlgoConnect from '@randlabs/myalgo-connect';

export interface WalletConnection {
  address: string;
  provider: string;
}

class WalletManager {
  private peraWallet: PeraWalletConnect;
  private myAlgoWallet: MyAlgoConnect;

  constructor() {
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
    
    this.myAlgoWallet = new MyAlgoConnect();
  }

  async connectPera(): Promise<WalletConnection> {
    try {
      const accounts = await this.peraWallet.connect();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      return {
        address: accounts[0],
        provider: 'Pera Wallet'
      };
    } catch (error) {
      console.error('Pera wallet connection failed:', error);
      throw new Error('Failed to connect to Pera Wallet');
    }
  }

  async connectMyAlgo(): Promise<WalletConnection> {
    try {
      const accounts = await this.myAlgoWallet.connect();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found in MyAlgo Wallet');
      }
      
      return {
        address: accounts[0].address,
        provider: 'MyAlgo Wallet'
      };
    } catch (error) {
      console.error('MyAlgo wallet connection failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('Connection cancelled by user');
        } else if (error.message.includes('not available')) {
          throw new Error('MyAlgo Wallet is not available. Please check your internet connection and try again.');
        } else {
          throw new Error(`MyAlgo connection failed: ${error.message}`);
        }
      }
      
      throw new Error('Failed to connect to MyAlgo Wallet. Please try again or use Pera Wallet instead.');
    }
  }

  disconnectPera(): void {
    this.peraWallet.disconnect();
  }

  // Check if MyAlgo is available
  isMyAlgoAvailable(): boolean {
    return true; // Always available since it's installed via npm
  }

  // Check if Pera is available
  isPeraAvailable(): boolean {
    return true; // Pera is always available as it's installed via npm
  }

  // Get MyAlgo instance for transaction signing
  getMyAlgoInstance(): MyAlgoConnect {
    return this.myAlgoWallet;
  }
}

export const walletManager = new WalletManager();