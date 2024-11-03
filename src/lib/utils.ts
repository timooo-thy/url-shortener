export function encode(num: number) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let str = "";

  while (num > 0) {
    str = chars[num % 62] + str;
    num = Math.floor(num / 62);
  }

  return str.padStart(6, "0");
}
