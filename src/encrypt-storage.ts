import { InvalidSecretKeyError } from './errors';
import { EncAlgorithm, Encryptation, getEncriptation } from './utils';

export interface EncryptStorageOptions {
  prefix?: string;
  stateManagementUse?: boolean;
  storageType?: 'localStorage' | 'sessionStorage';
  encAlgorithm?: EncAlgorithm;
}

export interface RemoveFromPatternOptions {
  exact?: boolean;
}

export interface GetFromPatternOptions extends RemoveFromPatternOptions {
  multiple?: boolean;
}

export interface EncryptStorageTypes extends Storage {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @usage
   * 		setItem('any_key', {key: 'value', another_key: 2})
   * 		setItem('any_key', 'any value')
   */
  setItem(key: string, value: any): void;

  /**
   * `getItem` - Is the faction to be get `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @usage
   * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
   * 		getItem('any_key') -> `'any value'`
   */
  getItem(key: string): string | any | undefined;

  /**
   * `removeItem` - Is the faction to be remove `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {void}
   * Returns `void`.
   * @usage
   * 		removeItem('any_key')
   */
  removeItem(key: string): void;

  /**
   * `getItemFromPattern` - Is the function to be get `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {any | Record<string, any> | undefined}
   * Returns `void`.
   * @usage
   *    // itemKey = '12345678:user'
   *    // another itemKey = '12345678:item'
   * 		getItemFromPattern('12345678') -> {'12345678:user': 'value', '12345678:item': 'otherValue'}
   */
  getItemFromPattern(
    pattern: string,
    options?: GetFromPatternOptions,
  ): Record<string, any> | any | undefined;

  /**
   * `removeItemFromPattern` - Is the function to be remove `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {void}
   * Returns `void`.
   * @usage
   *    // itemKey = '12345678:user'
   *    // another itemKey = '12345678:item'
   * 		removeItem('12345678') -> item removed from `selected storage`
   */
  removeItemFromPattern(
    pattern: string,
    options?: RemoveFromPatternOptions,
  ): void;

  /**
   * `clear` - Clear all selected storage
   */
  clear(): void;

  /**
   * `key` - Return a `key` in selected storage index or `null`
   * @param {number} index - Index of `key` in `selected storage`
   */
  key(index: number): string | null;

  /**
   * `encryptString` - Is the faction to be `encrypt` any string and return encrypted value
   * @param {string} str - A `string` to be encrypted.
   * @return {string} result
   * Returns `string`.
   * @usage
   * 		encryptString('any_string') -> 'encrypted value'
   */
  encryptString(key: string): string;

  /**
   * `decryptString` - Is the faction to be `decrypt` any string encrypted by `encryptString` and return decrypted value
   * @param {string} str - A `string` to be decrypted.
   * @return {string} result
   * Returns `string`.
   * @usage
   * 		decryptString('any_string') -> 'decrypted value'
   */
  decryptString(key: string): string;
}

const secret = new WeakMap();
/**
 * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
 *
 * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
 * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
 */
export class EncryptStorage implements EncryptStorageTypes {
  private readonly encriptation: Encryptation;

  private readonly storage: Storage;

  private readonly prefix: string;

  private readonly stateManagementUse: boolean;

  constructor(secretKey: string, options?: EncryptStorageOptions) {
    if (secretKey.length < 10) {
      throw new InvalidSecretKeyError();
    }

    const {
      storageType = 'localStorage',
      prefix = '',
      stateManagementUse = false,
      encAlgorithm = 'AES',
    } = options || {};

    secret.set(this, secretKey);

    this.storage = window[storageType];
    this.prefix = prefix;
    this.stateManagementUse = stateManagementUse;
    this.encriptation = getEncriptation(encAlgorithm, secret.get(this));
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  public get length() {
    return this.storage.length || 0;
  }

  public setItem(key: string, value: any): void {
    const storageKey = this.getKey(key);
    const valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encryptedValue = this.encriptation.encrypt(valueToString);

    this.storage.setItem(storageKey, encryptedValue);
  }

  public getItem<T = any>(key: string): T | undefined {
    const storageKey = this.getKey(key);
    const item = this.storage.getItem(storageKey);

    if (item) {
      const decryptedValue = this.encriptation.decrypt(item);

      if (this.stateManagementUse) {
        return decryptedValue as unknown as T;
      }

      try {
        return JSON.parse(decryptedValue) as T;
      } catch (error) {
        return decryptedValue as unknown as T;
      }
    }

    return undefined;
  }

  public removeItem(key: string): void {
    const storageKey = this.getKey(key);
    this.storage.removeItem(storageKey);
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    const { exact = false } = options;
    const storageKeys = Object.keys(this.storage);
    const filteredKeys = storageKeys.filter(key => {
      if (exact) {
        return key === this.getKey(pattern);
      }

      if (this.prefix) {
        return key.includes(pattern) && key.includes(this.prefix);
      }

      return key.includes(pattern);
    });

    filteredKeys.forEach(key => {
      this.storage.removeItem(key);
    });
  }

  public getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Record<string, any> | undefined {
    const { multiple = true, exact = false } = options;
    const keys = Object.keys(this.storage).filter(key => {
      if (exact) {
        return key === this.getKey(pattern);
      }

      if (this.prefix) {
        return key.includes(pattern) && key.includes(this.prefix);
      }

      return key.includes(pattern);
    });

    if (!keys.length) {
      return undefined;
    }

    if (!multiple) {
      const [key] = keys;

      const formattedKey = this.prefix
        ? key.replace(`${this.prefix}:`, '')
        : key;

      return this.getItem(formattedKey);
    }

    const value = keys.reduce((accumulator: Record<string, any>, key) => {
      const formattedKey = this.prefix
        ? key.replace(`${this.prefix}:`, '')
        : key;

      accumulator[formattedKey] = this.getItem(formattedKey);

      return accumulator;
    }, {});

    return value;
  }

  public clear(): void {
    this.storage.clear();
  }

  public key(index: number): string | null {
    return this.storage.key(index) || null;
  }

  public encryptString(str: string): string {
    const encryptedValue = this.encriptation.encrypt(str);

    return encryptedValue;
  }

  public decryptString(str: string): string {
    const decryptedValue = this.encriptation.decrypt(str);

    return decryptedValue;
  }
}

export default EncryptStorage;
