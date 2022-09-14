import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ChainInfoID } from "@cosmos-kit/types";
// import { WalletManagerProvider } from "@cosmos-kit/react";
// import { Bech32Address } from "@keplr-wallet/cosmos";
// import { MetaMaskProvider } from "metamask-react";
import detectEthereumProvider from "@metamask/detect-provider";

import "../styles/globals.css";
import Layout from "components/Layout";
import { WalletProvider } from "hooks/useWallet/context";
import { useEffect } from "react";
import useWalletStore from "stores/useWalletStore";

async function isMetamaskInstalled(): Promise<boolean> {
  const provider = await detectEthereumProvider();

  return !!provider;
}

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const actions = useWalletStore((state) => state.actions);

  // init store
  useEffect(() => {
    const verifyMetamask = async () => {
      actions.setMetamaskInstalledStatus(await isMetamaskInstalled());
    };

    console.log("HERE");

    verifyMetamask();
  }, [actions]);

  return (
    <>
      <Head>
        <title>Mars V2</title>
        {/* <meta name="description" content="Generated by create next app" /> */}
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          {/* <MetaMaskProvider>
        <WalletManagerProvider
          defaultChainId={ChainInfoID.Injective1}
          renderLoader={() => null}
          chainInfoOverrides={[
            {
              rpc: "https://injective-rpc.quickapi.com:443",
              rest: "https://lcd.injective.network",
              chainId: "injective-1",
              chainName: "Injective",
              bip44: {
                coinType: 60,
              },
              bech32Config: Bech32Address.defaultBech32Config("inj"),
              currencies: [
                {
                  coinDenom: "INJ",
                  coinMinimalDenom: "inj",
                  coinDecimals: 18,
                  // coinGeckoId: "injective-protocol",
                  // coinImageUrl: "/tokens/inj.svg",
                },
              ],
              feeCurrencies: [
                {
                  coinDenom: "INJ",
                  coinMinimalDenom: "inj",
                  coinDecimals: 18,
                },
              ],
              stakeCurrency: {
                coinDenom: "INJ",
                coinMinimalDenom: "inj",
                coinDecimals: 18,
              },
              gasPriceStep: {
                low: 0.0005,
                average: 0.0007,
                high: 0.0009,
              },
              features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
            },
          ]}
          classNames={{
            modalContent: "!hidden",
          }}
        > */}
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <ToastContainer
            autoClose={1500}
            closeButton={false}
            position="bottom-right"
            hideProgressBar
            icon={false}
            newestOnTop
            theme="colored"
            transition={Zoom}
          />
        </QueryClientProvider>
      </WalletProvider>
      {/* </WalletManagerProvider>
      </MetaMaskProvider> */}
    </>
  );
}

export default MyApp;
