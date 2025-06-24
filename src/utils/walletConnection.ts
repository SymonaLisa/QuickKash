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
      // Check if MyAlgo script is loaded
      if (!window.MyAlgoConnect) {
        // Try to load MyAlgo script dynamically
        await this.loadMyAlgoScript();
      }
      
      // Double check after loading attempt
      if (!window.MyAlgoConnect) {
        throw new Error('MyAlgo Wallet is not available. Please ensure you have a stable internet connection and try again.');
      }
      
      // @ts-ignore
      const myAlgoWallet = new window.MyAlgoConnect();
      const accounts = await myAlgoWallet.connect();
      
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

  private async loadMyAlgoScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.MyAlgoConnect) {
        resolve();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="myalgo.min.js"]');
      if (existingScript) {
        // Script exists but might not be loaded yet
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load MyAlgo script')));
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = 'https://wallet.myalgo.com/js/myalgo.min.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Give it a moment to initialize
        setTimeout(() => {
          if (window.MyAlgoConnect) {
            resolve();
          } else {
            reject(new Error('MyAlgo script loaded but MyAlgoConnect not available'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load MyAlgo Wallet script'));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('MyAlgo script loading timeout'));
      }, 10000);
    });
  }

  disconnectPera(): void {
    this.peraWallet.disconnect();
  }

  // Check if MyAlgo is available
  isMyAlgoAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.MyAlgoConnect;
  }

  // Check if Pera is available
  isPeraAvailable(): boolean {
    return true; // Pera is always available as it's installed via npm
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    MyAlgoConnect: any;
  }
}

export const walletManager = new WalletManager();