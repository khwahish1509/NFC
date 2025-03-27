import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

class NFCService {
  constructor() {
    this.init();
  }

  init = async () => {
    try {
      await NfcManager.start();
    } catch (error) {
      console.error('Failed to initialize NFC', error);
      throw error;
    }
  }

  cleanup = () => {
    NfcManager.cancelTechnologyRequest().catch(() => {
      // Ignore errors during cleanup
    });
  }

  // Scan an NFC tag to get its ID
  readNfcTag = () => {
    return new Promise<string>((resolve, reject) => {
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
  isNfcSupported = async () => {
    const isSupported = await NfcManager.isSupported();
    if (isSupported) {
      await NfcManager.start();
    }
    return isSupported;
  }
}

export default new NFCService(); 