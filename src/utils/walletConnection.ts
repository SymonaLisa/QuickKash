import { PeraWalletConnect } from '@perawallet/connect';

export interface WalletConnection {
  address: string;
  provider: string;
}

class WalletManager {
  private peraWallet: PeraWalletConnect;

  constructor() {
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
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
      // @ts-ignore - MyAlgo is loaded via CDN
      if (!window.MyAlgoConnect) {
        throw new Error('MyAlgo Wallet script could not be loaded. Please check your internet connection, disable any ad blockers, or refresh the page and try again.');
      }
      
      // @ts-ignore
      const myAlgoWallet = new window.MyAlgoConnect();
      const accounts = await myAlgoWallet.connect();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      return {
        address: accounts[0].address,
        provider: 'MyAlgo Wallet'
      };
    } catch (error) {
      console.error('MyAlgo wallet connection failed:', error);
      throw new Error('Failed to connect to MyAlgo Wallet');
    }
  }

  disconnectPera(): void {
    this.peraWallet.disconnect();
  }
}

export const walletManager = new WalletManager();