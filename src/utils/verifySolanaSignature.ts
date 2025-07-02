import nacl from 'tweetnacl';
import bs58 from 'bs58';

export function verifySolanaSignature({
  message,
  signatureB64,
  pubKeyB58,
}: {
  message: string;
  signatureB64: string;
  pubKeyB58: string;
}) {
  const msg = new TextEncoder().encode(message);
  const sig = Buffer.from(signatureB64, 'base64');
  const pk = bs58.decode(pubKeyB58);
  return nacl.sign.detached.verify(msg, sig, pk);
}
