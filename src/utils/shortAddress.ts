export function shortAddress(address: string, start = 6, end = 4) {
  return address.substring(0, start) + '...' + address.substring(address.length - end);
}
