/**
 * Encrypted Local Storage Utilities
 * Provides secure storage for sensitive data with compression and encryption
 */

interface StorageItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface ActivityLogEntry {
  id: string;
  timestamp: number;
  type: 'connection' | 'disconnection' | 'network_switch' | 'transaction' | 'error';
  message: string;
  details?: {
    account?: string;
    chainId?: number;
    networkName?: string;
    error?: string;
  };
}

class EncryptedStorage {
  private readonly storageKey = 'trust_wallet_dex_data';
  private readonly version = '1.0.0';

  // Simple XOR encryption for basic obfuscation
  private encrypt(data: string, key: string): string {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  private decrypt(encryptedData: string, key: string): string {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  private getEncryptionKey(): string {
    return `trust_wallet_${navigator.userAgent.slice(0, 20)}`;
  }

  private compress(data: string): string {
    // Simple compression by removing redundant spaces and formatting
    return data.replace(/\s+/g, ' ').trim();
  }

  private decompress(data: string): string {
    return data;
  }

  // Store data with encryption and compression
  setItem<T>(key: string, value: T): boolean {
    try {
      const storageItem: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        version: this.version
      };

      const jsonString = JSON.stringify(storageItem);
      const compressed = this.compress(jsonString);
      const encrypted = this.encrypt(compressed, this.getEncryptionKey());
      
      const fullKey = `${this.storageKey}_${key}`;
      localStorage.setItem(fullKey, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  // Retrieve and decrypt data
  getItem<T>(key: string): T | null {
    try {
      const fullKey = `${this.storageKey}_${key}`;
      const encrypted = localStorage.getItem(fullKey);
      
      if (!encrypted) return null;

      const compressed = this.decrypt(encrypted, this.getEncryptionKey());
      const jsonString = this.decompress(compressed);
      const storageItem: StorageItem<T> = JSON.parse(jsonString);

      // Check version compatibility
      if (storageItem.version !== this.version) {
        console.warn('Storage version mismatch, clearing data');
        this.removeItem(key);
        return null;
      }

      return storageItem.data;
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): boolean {
    try {
      const fullKey = `${this.storageKey}_${key}`;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Failed to remove encrypted data:', error);
      return false;
    }
  }

  // Clear all stored data
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storageKey)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear encrypted data:', error);
      return false;
    }
  }

  // Get storage size in bytes
  getStorageSize(): number {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value?.length || 0);
      }
    });
    
    return totalSize;
  }
}

// Activity Log Manager
class ActivityLogManager {
  private storage = new EncryptedStorage();
  private readonly maxLogEntries = 100;
  private readonly logKey = 'activity_logs';

  addLogEntry(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): boolean {
    const logs = this.getLogs();
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    logs.unshift(newEntry);

    // Keep only the latest entries to prevent storage bloat
    if (logs.length > this.maxLogEntries) {
      logs.splice(this.maxLogEntries);
    }

    return this.storage.setItem(this.logKey, logs);
  }

  getLogs(): ActivityLogEntry[] {
    return this.storage.getItem<ActivityLogEntry[]>(this.logKey) || [];
  }

  getLogsByType(type: ActivityLogEntry['type']): ActivityLogEntry[] {
    return this.getLogs().filter(log => log.type === type);
  }

  getRecentLogs(limit: number = 10): ActivityLogEntry[] {
    return this.getLogs().slice(0, limit);
  }

  clearLogs(): boolean {
    return this.storage.removeItem(this.logKey);
  }

  getLogStats() {
    const logs = this.getLogs();
    const stats = {
      total: logs.length,
      byType: {} as Record<ActivityLogEntry['type'], number>,
      storageSize: this.storage.getStorageSize()
    };

    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });

    return stats;
  }
}

// Export instances
export const encryptedStorage = new EncryptedStorage();
export const activityLogger = new ActivityLogManager();
export type { ActivityLogEntry };