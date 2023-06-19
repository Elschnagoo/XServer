// eslint-disable-next-line import/prefer-default-export

export function convertString(str: string): string {
  str = str.replace(/&#39;/g, "'");
  return str;
}
