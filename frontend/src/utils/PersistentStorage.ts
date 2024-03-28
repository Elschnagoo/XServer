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

  static getDefaultQuery() {
    return LocalStorage.load(
      'default-query',
      'https://www.youtube.com/results?search_query=',
    )!;
  }

  static setDefaultQuery(options: string) {
    return LocalStorage.save('default-query', options);
  }
}
