const uidReg =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
// eslint-disable-next-line import/prefer-default-export
export function isUUID(str: string): boolean {
  return uidReg.test(str);
}
export function isString(a: unknown): a is string {
  return typeof a === 'string' && a.length > 0;
}

export function getString(a: unknown): string | undefined {
  if (isString(a)) {
    return a;
  }
  return undefined;
}

export function isNumber(a: unknown): a is number {
  return typeof a === 'number';
}

export function getNumber(a: unknown): number | undefined {
  if (isNumber(a)) {
    return a;
  }
  return undefined;
}

export function isBoolean(a: unknown): a is boolean {
  return typeof a === 'boolean';
}

export function getBoolean(a: unknown): boolean | undefined {
  if (isBoolean(a)) {
    return a;
  }
  return undefined;
}

export function convertLabel(label?: unknown): string[] | undefined {
  let lab: string[] | undefined;
  try {
    if (label) {
      if (!isString(label)) {
        return undefined;
      }
      lab = label.split(';');
      let valid = true;
      lab.forEach((cur) => {
        if (!isUUID(cur)) {
          valid = false;
        }
      });
      if (!valid) {
        return undefined;
      }
    }
  } catch (e) {
    return undefined;
  }
  return lab;
}

type PropType<T> = {
  [K in keyof T]: T[K];
};

export function inputValidation<T>(
  i: PropType<T>,
  ext: {
    key: keyof T;
    type: 'string' | 'number' | 'boolean' | 'label';
  }[],
) {
  const out: Partial<PropType<T>> = {};

  ext.forEach((e) => {
    switch (e.type) {
      case 'boolean':
        out[e.key] = getBoolean(i[e.key]) as any;
        break;
      case 'number':
        out[e.key] = getNumber(i[e.key]) as any;
        break;
      case 'string':
        out[e.key] = getString(i[e.key]) as any;
        break;
      case 'label':
        out[e.key] = convertLabel(i[e.key]) as any;
        break;
      default:
    }
  });

  return out;
}
