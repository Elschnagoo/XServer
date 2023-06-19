export default class LocalStorage {
  static save(key: string, val: string) {
    window.localStorage.setItem(key, val);
  }

  static load(key: string, defaultValue = '') {
    return window.localStorage.getItem(key) || defaultValue;
  }

  static jsonSave<T = any>(key: string, val: T) {
    try {
      this.save(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  }

  static jsonLoad<T = any>(key: string): T | null {
    try {
      return JSON.parse(this.load(key));
    } catch (e) {
      return null;
    }
  }

  static flagSave(key: string, val: boolean) {
    this.save(key, val ? 'true' : 'false');
  }

  static flagLoad(key: string) {
    return this.load(key, 'false') === 'true';
  }

  static delete(key: string) {
    window.localStorage.removeItem(key);
  }
}
