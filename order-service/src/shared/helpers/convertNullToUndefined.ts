/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export default function convertNullToUndefined<T>(myObject: any, trulyNullValue: Array<string> = []): T {
  const result = { ...myObject };

  for (const key in result) {
    if (result[key] === null && !trulyNullValue.includes(key)) {
      result[key] = undefined;
    }
  }

  return result as T;
}
