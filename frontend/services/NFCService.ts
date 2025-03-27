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
    console.log('NFC manager successfully imported');
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
      console.log('Starting NFC manager...');
      await NfcManager.start();
      console.log('Checking if NFC is supported...');
      const supported = await NfcManager.isSupported();
      console.log('NFC supported:', supported);
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
      console.log('NFC not supported (web or no NfcManager)');
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
      console.log('Registering for NFC tag events...');
      await NfcManager.registerTagEvent();
      
      // Wait for tag detection
      console.log('Waiting for NFC tag...');
      const tag = await new Promise<any>((resolve, reject) => {
        const cleanUp = () => {
          NfcManager.unregisterTagEvent().catch(() => {});
        };
        
        NfcManager.setEventListener('error', (error: any) => {
          console.log('NFC error event:', error);
          cleanUp();
          reject(error);
        });
        
        NfcManager.setEventListener('ndefDiscovered', (tag: any) => {
          console.log('NDEF tag discovered:', tag);
          cleanUp();
          resolve(tag);
        });
        
        NfcManager.setEventListener('tag', (tag: any) => {
          console.log('NFC tag detected:', tag);
          cleanUp();
          resolve(tag);
        });
        
        // Set a timeout
        setTimeout(() => {
          console.log('NFC read timeout');
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
        console.log('Processing NDEF message');
        const ndefRecord = tag.ndefMessage[0];
        if (ndefRecord) {
          const payload = Ndef.text.decodePayload(ndefRecord.payload);
          console.log('Decoded payload:', payload);
          return payload;
        }
      }
      
      // If NDEF message not found, use tag ID or a simulated ID for testing
      const tagId = tag && tag.id ? `tag-${tag.id}` : 'simulated-tag-id';
      console.log('Using tag ID:', tagId);
      return tagId;
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
      console.log('Registering for NFC tag events (write)...');
      await NfcManager.registerTagEvent();
      
      // Wait for tag detection
      console.log('Waiting for NFC tag to write...');
      const tag = await new Promise<any>((resolve, reject) => {
        const cleanUp = () => {
          NfcManager.unregisterTagEvent().catch(() => {});
        };
        
        NfcManager.setEventListener('error', (error: any) => {
          console.log('NFC write error event:', error);
          cleanUp();
          reject(error);
        });
        
        NfcManager.setEventListener('ndefDiscovered', (tag: any) => {
          console.log('NDEF tag discovered for writing:', tag);
          cleanUp();
          resolve(tag);
        });
        
        NfcManager.setEventListener('tag', (tag: any) => {
          console.log('NFC tag detected for writing:', tag);
          cleanUp();
          resolve(tag);
        });
        
        // Set a timeout
        setTimeout(() => {
          console.log('NFC write timeout');
          cleanUp();
          reject(new Error('Timeout: No NFC tag detected for writing'));
        }, 30000); // 30 seconds timeout
      });
      
      // Create text record with our data
      console.log('Preparing NDEF message with data:', data);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);
      
      // Write to tag
      if (bytes) {
        console.log('Writing NDEF message to tag...');
        await NfcManager.writeNdefMessage(bytes);
        console.log('Successfully wrote to NFC tag');
        
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
        console.log('NFC operation canceled');
      } catch (error) {
        console.error('Error canceling NFC operation', error);
      }
    }
  }

  // Mock methods for testing
  static mockReadNfcTag(): Promise<string> {
    console.log('Using mock NFC read');
    return Promise.resolve('simulated-tag-id');
  }

  static mockWriteNfcTag(data: string): Promise<boolean> {
    console.log('Using mock NFC write with data:', data);
    return Promise.resolve(true);
  }
}

export default NFCService; 