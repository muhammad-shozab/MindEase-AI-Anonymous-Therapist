// Singleton Pattern - Single instance for encryption/decryption
import CryptoJS from 'crypto-js';

class EncryptionService {
  private static instance: EncryptionService;

  private constructor() {
    // Private constructor ensures singleton
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Encrypt data with AES-256
  encrypt(data: string, key: string): string {
    try {
      return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  decrypt(encryptedData: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
  }

  // Generate a session ID (recovery code)
  generateSessionId(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    return randomBytes.toString(CryptoJS.enc.Hex).substring(0, 24).toUpperCase();
  }

  // Derive encryption key from session ID
  deriveKey(sessionId: string): string {
    return CryptoJS.SHA256(sessionId).toString();
  }
}

export default EncryptionService;
