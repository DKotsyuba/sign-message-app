import React, { useCallback, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  Textarea,
  Tooltip,
  useClipboard,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCheck, FaCopy, FaExchangeAlt, FaRedo, FaSignature, FaTimes } from 'react-icons/fa';
import { useConnectWallet } from '@/hooks';

// The message to sign
const MESSAGE = 'Hello World';

type Props = {
  connectWallet: () => void;
};

const MessageSigner: React.FC<Props> = ({ connectWallet }) => {
  const {
    signMessage: walletSignMessage,
    verifySignature: walletVerifySignature,
    isWalletConnected,
  } = useConnectWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState(MESSAGE);
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [isVerifyingSignature, setIsVerifyingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const { hasCopied, onCopy } = useClipboard(signature || '');

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const messageBg = useColorModeValue('gray.50', 'gray.600');

  const resetSignature = useCallback(() => {
    setSignature(null);
    setSignatureError(null);
    setVerificationResult(null);
  }, []);

  const signMessage = useCallback(async () => {
    try {
      setIsSigningMessage(true);
      setSignatureError(null);
      resetSignature();

      const signedMessage = await walletSignMessage(message);
      setSignature(signedMessage);
    } catch (err) {
      console.error('Error signing message:', err);
      setSignatureError(err instanceof Error ? err.message : 'Failed to sign message');
    } finally {
      setIsSigningMessage(false);
    }
  }, [message, resetSignature, walletSignMessage]);

  const verifySignature = useCallback(async () => {
    if (!signature || !isWalletConnected) {
      return;
    }

    try {
      setIsVerifyingSignature(true);
      const result = await walletVerifySignature(message, signature);
      setVerificationResult(result);
    } catch (err) {
      console.error('Error verifying signature:', err);
      setVerificationResult(false);
    } finally {
      setIsVerifyingSignature(false);
    }
  }, [message, signature, isWalletConnected, walletVerifySignature]);

  const signMessageOrConnectWallet = useCallback(async () => {
    if (!isWalletConnected) {
      connectWallet();
    } else {
      await signMessage();
    }
  }, [connectWallet, isWalletConnected, signMessage]);

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Sign Message
      </Heading>

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
        <CardHeader pb={2}>
          <Flex justify="space-between" align="center">
            <Heading size="md" display="flex" alignItems="center">
              <FaSignature style={{ marginRight: '8px' }} />
              Message Signing
            </Heading>
          </Flex>
        </CardHeader>

        <CardBody>
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>
              Message to sign:
            </Text>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              bg={messageBg}
              mb={2}
            />
            <Text fontSize="sm" color="gray.500">
              This message will be signed with your connected wallet.
            </Text>
          </Box>

          {!isWalletConnected && (
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertDescription>Please connect a wallet first to sign messages.</AlertDescription>
            </Alert>
          )}

          {signatureError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertDescription>{signatureError}</AlertDescription>
            </Alert>
          )}

          {signature && (
            <Box mb={4}>
              <Flex align="center" mb={2} justify="space-between">
                <Flex align="center">
                  <Text fontWeight="bold">Signature:</Text>
                  <Tooltip label={hasCopied ? 'Copied!' : 'Copy signature'} placement="top">
                    <IconButton
                      aria-label="Copy signature"
                      icon={<FaCopy />}
                      size="sm"
                      ml={2}
                      onClick={onCopy}
                      variant="ghost"
                    />
                  </Tooltip>
                </Flex>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={verifySignature}
                  isLoading={isVerifyingSignature}
                  loadingText="Verifying"
                  leftIcon={<FaCheck />}
                >
                  Verify Signature
                </Button>
              </Flex>
              <Textarea
                value={signature}
                isReadOnly
                bg={messageBg}
                size="sm"
                fontFamily="monospace"
                height="100px"
                mb={2}
              />

              {verificationResult !== null && (
                <Alert status={verificationResult ? 'success' : 'error'} borderRadius="md" mb={2}>
                  <AlertIcon />
                  <AlertDescription>
                    {verificationResult
                      ? 'Signature verified successfully!'
                      : 'Signature verification failed!'}
                  </AlertDescription>
                  {verificationResult ? (
                    <FaCheck color="green" style={{ marginLeft: '8px' }} />
                  ) : (
                    <FaTimes color="red" style={{ marginLeft: '8px' }} />
                  )}
                </Alert>
              )}

              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertDescription>Message signed successfully!</AlertDescription>
              </Alert>
            </Box>
          )}

          <Flex gap={4}>
            <Button
              onClick={signMessageOrConnectWallet}
              colorScheme="brand"
              isLoading={isSigningMessage}
              loadingText="Signing"
              isDisabled={isSigningMessage}
              spinner={<Spinner size="sm" />}
              leftIcon={isWalletConnected ? <FaSignature /> : <FaExchangeAlt />}
              flex={1}
            >
              {isWalletConnected ? 'Sign Message' : 'Connect Wallet'}
            </Button>

            {isWalletConnected && (
              <Button
                onClick={connectWallet}
                colorScheme="blue"
                variant="outline"
                leftIcon={<FaExchangeAlt />}
                isDisabled={isSigningMessage}
              >
                Switch Wallet
              </Button>
            )}

            {signature && (
              <Button
                onClick={resetSignature}
                variant="outline"
                leftIcon={<FaRedo />}
                isDisabled={isSigningMessage}
              >
                Reset
              </Button>
            )}
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default MessageSigner;
