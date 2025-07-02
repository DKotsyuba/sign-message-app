import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useConnectWallet } from '@/hooks';
import { FaMoon, FaSun } from 'react-icons/fa';
import MessageSigner from './components/MessageSigner';
import WalletConnector from './components/WalletConnector';
import { shortAddress } from '@/utils';

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { activeWalletAddress, activeWalletName, activeWalletNetwork, isWalletConnected } =
    useConnectWallet();

  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
      <Container maxW="container.md" py={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <Heading as="h1" size="xl">
            Sign Message App
          </Heading>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Connect Wallet</ModalHeader>
            <ModalBody>
              <WalletConnector />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Box mb={8}>
          {isWalletConnected ? (
            <Flex direction="column" gap={2}>
              <Flex align="center" gap={2}>
                <Text fontSize="lg" fontWeight="bold">
                  Connected Wallet:
                </Text>
                <Badge colorScheme="green">{activeWalletName}</Badge>
                <Badge colorScheme="blue">{activeWalletNetwork}</Badge>
              </Flex>
              {activeWalletAddress && (
                <Text fontSize="md" color="gray.500">
                  Address: {shortAddress(activeWalletAddress, 10, 6)}
                </Text>
              )}
            </Flex>
          ) : (
            <Text fontSize="lg">Please connect a wallet to sign messages.</Text>
          )}
        </Box>

        <Box mt={10}>
          <MessageSigner connectWallet={() => onOpen()} />
        </Box>
      </Container>
    </Box>
  );
}

export default App;
