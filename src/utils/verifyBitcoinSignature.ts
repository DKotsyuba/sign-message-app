import { Verifier } from 'bip322-js';

export function verifyBitcoinSignature({
  message,
  signature,
  address,
}: {
  message: string;
  signature: string;
  address: string;
}): boolean {
  return Verifier.verifySignature(address, message, signature);
}
