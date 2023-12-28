import LocalStorage from '@/utils/LocalStorage';

export type MultiViewOptions = { maxR: number; maxC: number };
export default class PersistentStorage extends LocalStorage {
  static getMultiOptions() {
    return LocalStorage.jsonLoad<MultiViewOptions>('multiView', {
      maxR: 2,
      maxC: 2,
    })!;
  }

  static setMultiOptions(options: MultiViewOptions) {
    return LocalStorage.jsonSave<MultiViewOptions>('multiView', options);
  }
}
