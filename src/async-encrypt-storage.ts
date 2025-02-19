import { EncryptStorage, EncryptStorageOptions } from './encrypt-storage';

export class AsyncEncryptStorage {
  private encryptStorage: EncryptStorage;

  constructor(secretKey: string, options?: EncryptStorageOptions) {
    this.encryptStorage = new EncryptStorage(secretKey, options);
  }

  public get length(): Promise<number> {
    return Promise.resolve(this.encryptStorage.length);
  }

  public async setItem(key: string, value: any): Promise<void> {
    return new Promise(resolve => {
      resolve(this.encryptStorage.setItem(key, value));
    });
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    return new Promise(resolve => {
      const storageValue = this.encryptStorage.getItem<T>(key);
      resolve(storageValue);
    });
  }

  public async removeItem(key: string): Promise<void> {
    return new Promise(resolve => {
      resolve(this.encryptStorage.removeItem(key));
    });
  }

  public async getItemFromPattern(
    pattern: string,
  ): Promise<Record<string, any> | undefined> {
    return new Promise(resolve => {
      const storageValues = this.encryptStorage.getItemFromPattern(pattern);
      resolve(storageValues);
    });
  }

  public async removeItemFromPattern(pattern: string): Promise<void> {
    return new Promise(resolve => {
      resolve(this.encryptStorage.removeItemFromPattern(pattern));
    });
  }

  public async clear(): Promise<void> {
    return new Promise(resolve => {
      resolve(this.encryptStorage.clear());
    });
  }

  public async key(index: number): Promise<string | null> {
    return new Promise(resolve => {
      resolve(this.encryptStorage.key(index));
    });
  }

  public async encryptString(str: string): Promise<string> {
    return new Promise(resolve => {
      const encryptedValue = this.encryptStorage.encryptString(str);
      resolve(encryptedValue);
    });
  }

  public async decryptString(str: string): Promise<string> {
    return new Promise(resolve => {
      const decryptedValue = this.encryptStorage.decryptString(str);
      resolve(decryptedValue);
    });
  }
}
