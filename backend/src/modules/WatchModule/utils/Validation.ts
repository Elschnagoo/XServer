const uidReg =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
// eslint-disable-next-line import/prefer-default-export
export function isUUID(str: string): boolean {
  return uidReg.test(str);
}
