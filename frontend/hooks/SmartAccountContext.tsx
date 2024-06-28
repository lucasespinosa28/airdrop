import { ConnectedWallet, useWallets } from "@privy-io/react-auth";
import {
    ENTRYPOINT_ADDRESS_V06,
    SmartAccountClient,
    createSmartAccountClient,
    walletClientToSmartAccountSigner,
} from "permissionless";
import React, { useContext, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia } from "viem/chains";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

const rpcUrl = "https://api.developer.coinbase.com/rpc/v1/base-sepolia/O69gR1ZwN5XzwFe9gyz0vjrNvJIQ7rgs";
/** Interface returned by custom `useSmartAccount` hook */
interface SmartAccountInterface {
    /** Privy embedded wallet, used as a signer for the smart account */
    eoa: ConnectedWallet | undefined;
    /** Smart account client to send signature/transaction requests to the smart account */
    smartAccountClient: SmartAccountClient<any> | undefined;
    /** Smart account address */
    smartAccountAddress: `0x${string}` | undefined;
    /** Boolean to indicate whether the smart account state has initialized */
    smartAccountReady: boolean;
  }

  const SmartAccountContext = React.createContext<SmartAccountInterface>({
    eoa: undefined,
    smartAccountClient: undefined,
    smartAccountAddress: undefined,
    smartAccountReady: false,
  });

  export const useSmartAccount = () => {
    return useContext(SmartAccountContext);
  };

  export const SmartAccountProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    // Get a list of all of the wallets (EOAs) the user has connected to your site
    const {wallets} = useWallets();
    // Find the embedded wallet by finding the entry in the list with a `walletClientType` of 'privy'
    const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
  
    // States to store the smart account and its status
    const [eoa, setEoa] = useState<ConnectedWallet | undefined>();
    const [smartAccountClient, setSmartAccountClient] = useState<any | undefined>();
    const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | undefined>();
    const [smartAccountReady, setSmartAccountReady] = useState(false);
  
    useEffect(() => {
      // Creates a smart account given a Privy `ConnectedWallet` object representing
      // the  user's EOA.
      const createSmartWallet = async (eoa: ConnectedWallet) => {
        setEoa(eoa);
        // Get an EIP1193 provider and viem WalletClient for the EOA
        const eip1193provider = await eoa.getEthereumProvider();
        const privyClient = createWalletClient({
          account: eoa.address as `0x${string}`,
          chain: baseSepolia,
          transport: custom(eip1193provider),
        });
  
        const customSigner = walletClientToSmartAccountSigner(privyClient);
  
        const publicClient = createPublicClient({ 
          chain: baseSepolia, // Replace this with the chain of your app
          transport: http(rpcUrl)
        })
  
        const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
          entryPoint: ENTRYPOINT_ADDRESS_V06,
          signer: customSigner,
          factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
        });

        const cloudPaymaster = createPimlicoPaymasterClient({
            chain: baseSepolia,
            transport: http(rpcUrl),
            entryPoint: ENTRYPOINT_ADDRESS_V06,
        });
        
  
        const smartAccountClient = createSmartAccountClient({
            account: simpleAccount,
            chain: baseSepolia,
            bundlerTransport: http(rpcUrl),
            // IMPORTANT: Set up Cloud Paymaster to sponsor your transaction
            middleware: {
                sponsorUserOperation: cloudPaymaster.sponsorUserOperation,
            },
        });
  
        const smartAccountAddress = smartAccountClient.account?.address;
  
        setSmartAccountClient(smartAccountClient);
        setSmartAccountAddress(smartAccountAddress);
        setSmartAccountReady(true);
      };
  
      if (embeddedWallet) createSmartWallet(embeddedWallet);
    }, [embeddedWallet, embeddedWallet?.address]);
  
  
    return (
      <SmartAccountContext.Provider
        value={{
          smartAccountReady: smartAccountReady,
          smartAccountClient: smartAccountClient,
          smartAccountAddress: smartAccountAddress,
          eoa: eoa,
        }}
      >
        {children}
      </SmartAccountContext.Provider>
    );
  };