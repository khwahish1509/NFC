import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Platform } from 'react-native';

class NFCService {
  isNfcSupported: boolean = false;

  constructor() {
    // Only initialize NFC on actual devices, not on web
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      this.init();
    }
  }

  init = async () => {
    try {
      await NfcManager.start();
      this.isNfcSupported = true;
    } catch (error) {
      console.error('Failed to initialize NFC', error);
      this.isNfcSupported = false;
    }
  }

  cleanup = () => {
    if (!this.isNfcSupported) return;
    
    NfcManager.cancelTechnologyRequest().catch(() => {
      // Ignore errors during cleanup
    });
  }

  // Scan an NFC tag to get its ID
  readNfcTag = () => {
    return new Promise<string>((resolve, reject) => {
      if (!this.isNfcSupported) {
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
            resolve(tag.id);
          } catch (error) {
            cleanupAndReject(error as Error);
          } finally {
            this.cleanup();
          }
        })
        .catch((error) => {
          cleanupAndReject(error);
        });
    });
  }

  // Write product ID to an NFC tag
  writeNfcTag = async (productId: string) => {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.isNfcSupported) {
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
        .catch((error) => {
          cleanupAndReject(error);
        });
    });
  }

  // Check if NFC is supported by the device
  checkIsNfcSupported = async () => {
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