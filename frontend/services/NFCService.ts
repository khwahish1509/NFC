import { Platform } from 'react-native';

// Safely import NFC manager only on native platforms
let NfcManager: any = null;
let Ndef: any = null;

// Only try to import NFC modules on native platforms
if (Platform.OS !== 'web') {
  try {
    const NfcManagerModule = require('react-native-nfc-manager');
    NfcManager = NfcManagerModule.default;
    Ndef = NfcManagerModule.Ndef;
  } catch (error) {
    console.log('NFC module import failed. This is expected in Expo Go.', error);
  }
}

class NFCService {
  static isNfcSupported = false;
  static isInitialized = false;

  static async initialize(): Promise<boolean> {
    // Don't attempt to initialize if we couldn't import the module
    if (!NfcManager) {
      console.log('NFC Manager not available on this platform');
      return false;
    }

    try {
      await NfcManager.start();
      const supported = await NfcManager.isSupported();
      this.isNfcSupported = supported;
      this.isInitialized = true;
      return supported;
    } catch (error) {
      console.error('Failed to initialize NFC', error);
      this.isNfcSupported = false;
      return false;
    }
  }

  static async checkIsNfcSupported(): Promise<boolean> {
    // If on web or NfcManager not available, return false
    if (Platform.OS === 'web' || !NfcManager) {
      return false;
    }

    if (!this.isInitialized) {
      return this.initialize();
    }
    return this.isNfcSupported;
  }

  static async readNfcTag(): Promise<string> {
    // Ensure NFC is available and initialized
    if (!NfcManager || !await this.checkIsNfcSupported()) {
      throw new Error('NFC is not supported on this device');
    }

    try {
      // Register tag event listener
      await NfcManager.registerTagEvent();
      
      // Wait for tag detection
      const tag = await new Promise<any>((resolve, reject) => {
        const cleanUp = () => {
          NfcManager.unregisterTagEvent().catch(() => {});
        };
        
        NfcManager.setEventListener('error', (error: any) => {
          cleanUp();
          reject(error);
        });
        
        NfcManager.setEventListener('ndefDiscovered', (tag: any) => {
          cleanUp();
          resolve(tag);
        });
        
        NfcManager.setEventListener('tag', (tag: any) => {
          cleanUp();
          resolve(tag);
        });
        
        // Set a timeout
        setTimeout(() => {
          cleanUp();
          reject(new Error('Timeout: No NFC tag detected'));
        }, 30000); // 30 seconds timeout
      });
      
      // Clean up event listeners
      NfcManager.setEventListener('error', null);
      NfcManager.setEventListener('ndefDiscovered', null);
      NfcManager.setEventListener('tag', null);
      
      // Process tag data
      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        // Get the text content from NDEF message
        const ndefRecord = tag.ndefMessage[0];
        if (ndefRecord) {
          return Ndef.text.decodePayload(ndefRecord.payload);
        }
      }
      
      // If NDEF message not found, use tag ID or a simulated ID for testing
      return tag && tag.id ? `tag-${tag.id}` : 'simulated-tag-id';
    } catch (error) {
      console.error('Error during NFC reading', error);
      if (NfcManager) {
        await NfcManager.unregisterTagEvent().catch(() => {});
      }
      throw error;
    }
  }

  static async writeNfcTag(data: string): Promise<boolean> {
    // Ensure NFC is available and initialized
    if (!NfcManager || !Ndef || !await this.checkIsNfcSupported()) {
      throw new Error('NFC is not supported on this device');
    }

    try {
      // Register tag event listener
      await NfcManager.registerTagEvent();
      
      // Wait for tag detection
      const tag = await new Promise<any>((resolve, reject) => {
        const cleanUp = () => {
          NfcManager.unregisterTagEvent().catch(() => {});
        };
        
        NfcManager.setEventListener('error', (error: any) => {
          cleanUp();
          reject(error);
        });
        
        NfcManager.setEventListener('ndefDiscovered', (tag: any) => {
          cleanUp();
          resolve(tag);
        });
        
        NfcManager.setEventListener('tag', (tag: any) => {
          cleanUp();
          resolve(tag);
        });
        
        // Set a timeout
        setTimeout(() => {
          cleanUp();
          reject(new Error('Timeout: No NFC tag detected'));
        }, 30000); // 30 seconds timeout
      });
      
      // Create text record with our data
      const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);
      
      // Write to tag
      if (bytes) {
        await NfcManager.writeNdefMessage(bytes);
        
        // Clean up event listeners
        NfcManager.setEventListener('error', null);
        NfcManager.setEventListener('ndefDiscovered', null);
        NfcManager.setEventListener('tag', null);
        
        return true;
      } else {
        throw new Error('Failed to encode NDEF message');
      }
    } catch (error) {
      console.error('Error during NFC writing', error);
      if (NfcManager) {
        await NfcManager.unregisterTagEvent().catch(() => {});
      }
      throw error;
    }
  }

  static async cancelNfcOperation(): Promise<void> {
    if (NfcManager) {
      try {
        await NfcManager.unregisterTagEvent();
      } catch (error) {
        console.error('Error canceling NFC operation', error);
      }
    }
  }

  // Mock methods for testing
  static mockReadNfcTag(): Promise<string> {
    return Promise.resolve('simulated-tag-id');
  }

  static mockWriteNfcTag(data: string): Promise<boolean> {
    console.log('Simulated writing to NFC tag:', data);
    return Promise.resolve(true);
  }
}

export default NFCService; 