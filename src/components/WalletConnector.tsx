import React, { useCallback } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  List,
  ListItem,
  Spacer,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useConnectWallet } from '@/hooks';
import { ConnectWalletDriver } from '@/models/ConnectWalletDriver.ts';
import { shortAddress } from '@/utils';

const WalletConnector: React.FC = () => {
  const { detectedWallets, activeWalletName, connect, disconnect, switchWallet } =
    useConnectWallet();

  const isActiveWallet = useCallback(
    (wallet: ConnectWalletDriver) => {
      return wallet.name === activeWalletName;
    },
    [activeWalletName]
  );

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const connectBorderColor = useColorModeValue('brand.500', 'brand.500');
  const activeBorderColor = useColorModeValue('green.500', 'green.500');

  return (
    <Box>
      <List spacing={3}>
        {detectedWallets.map(wallet => (
          <ListItem key={wallet.name}>
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={
                wallet.isConnected
                  ? isActiveWallet(wallet)
                    ? activeBorderColor
                    : connectBorderColor
                  : borderColor
              }
              borderRadius="md"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: 'md' }}
            >
              <CardBody>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Text fontWeight="medium" fontSize="md">
                      {wallet.name}
                    </Text>
                    {isActiveWallet(wallet) && (
                      <Badge colorScheme="green" variant="subtle">
                        Connected
                      </Badge>
                    )}
                    {wallet.address && (
                      <Text fontSize="xs" color="gray.500" ml={2}>
                        {shortAddress(wallet.address)}
                      </Text>
                    )}
                  </Flex>
                  <Spacer />
                  {isActiveWallet(wallet) ? (
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </Button>
                  ) : wallet.isConnected ? (
                    <Button colorScheme="blue" size="sm" onClick={() => switchWallet(wallet)}>
                      Switch
                    </Button>
                  ) : (
                    <Button colorScheme="blue" size="sm" onClick={() => connect(wallet)}>
                      Connect
                    </Button>
                  )}
                </Flex>
              </CardBody>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WalletConnector;
