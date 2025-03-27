import { Platform } from 'react-native';

// Conditionally import NFC manager to avoid crashes
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;

// Only try to import the NFC functionality on native platforms
try {
  if (Platform.OS !== 'web') {
    const NfcPackage = require('react-native-nfc-manager');
    NfcManager = NfcPackage.default;
    NfcTech = NfcPackage.NfcTech;
    Ndef = NfcPackage.Ndef;
  }
} catch (error) {
  console.log('NFC functionality not available:', error);
}

class NFCService {
  isNfcSupported: boolean = false;

  constructor() {
    // Only initialize NFC if the module was successfully imported
    if (NfcManager && (Platform.OS === 'android' || Platform.OS === 'ios')) {
      this.init();
    }
  }

  init = async () => {
    try {
      if (!NfcManager) return;
      
      await NfcManager.start();
      this.isNfcSupported = true;
    } catch (error) {
      console.error('Failed to initialize NFC', error);
      this.isNfcSupported = false;
    }
  }

  cleanup = () => {
    if (!this.isNfcSupported || !NfcManager) return;
    
    NfcManager.cancelTechnologyRequest().catch(() => {
      // Ignore errors during cleanup
    });
  }

  // Scan an NFC tag to get its ID
  readNfcTag = () => {
    return new Promise<string>((resolve, reject) => {
      if (!this.isNfcSupported || !NfcManager) {
        reject(new Error('NFC not supported on this device or platform'));
        return;
      }

      const cleanupAndReject = (error: Error) => {
        this.cleanup();
        reject(error);
      };

      NfcManager.requestTechnology(NfcTech.Ndef)
        .then(async () => {
          try {
            const tag = await NfcManager.getTag();
            if (!tag) {
              throw new Error('Failed to read NFC tag');
            }
            
            // Use tag ID as identifier
            resolve(tag.id || 'mock-id-for-testing');
          } catch (error) {
            cleanupAndReject(error as Error);
          } finally {
            this.cleanup();
          }
        })
        .catch((error: any) => {
          cleanupAndReject(error);
        });
    });
  }

  // Write product ID to an NFC tag
  writeNfcTag = async (productId: string) => {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.isNfcSupported || !NfcManager || !Ndef) {
        reject(new Error('NFC not supported on this device or platform'));
        return;
      }

      const cleanupAndReject = (error: Error) => {
        this.cleanup();
        reject(error);
      };

      NfcManager.requestTechnology(NfcTech.Ndef)
        .then(async () => {
          try {
            // Format the data to write
            const bytes = Ndef.encodeMessage([
              Ndef.textRecord(productId)
            ]);

            if (bytes) {
              await NfcManager.ndefHandler.writeNdefMessage(bytes);
              resolve(true);
            } else {
              throw new Error('Failed to encode message');
            }
          } catch (error) {
            cleanupAndReject(error as Error);
          } finally {
            this.cleanup();
          }
        })
        .catch((error: any) => {
          cleanupAndReject(error);
        });
    });
  }

  // Check if NFC is supported by the device
  checkIsNfcSupported = async () => {
    // If NfcManager is not available, return false
    if (!NfcManager) return false;
    
    // For web, always return false
    if (Platform.OS === 'web') {
      return false;
    }
    
    try {
      const isSupported = await NfcManager.isSupported();
      if (isSupported) {
        await NfcManager.start();
        this.isNfcSupported = true;
      }
      return isSupported;
    } catch (error) {
      console.error('Error checking NFC support:', error);
      return false;
    }
  }
}

export default new NFCService(); 