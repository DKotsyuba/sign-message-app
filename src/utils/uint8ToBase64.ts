export function uint8ToBase64(uint8: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8));
}
