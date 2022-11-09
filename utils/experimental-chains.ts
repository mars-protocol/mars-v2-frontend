import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainId, CosmosChainId, TestnetCosmosChainId } from 'types'

export const getEndpointsFromChainId = (
  chainId: TestnetCosmosChainId | CosmosChainId | ChainId,
): { rpc: string; rest: string } => {
  switch (chainId) {
    case CosmosChainId.Osmosis:
      return {
        rpc: 'https://tm.osmosis.injective.network',
        rest: 'https://lcd.osmosis.injective.network',
      }
    case CosmosChainId.Injective:
      return {
        rpc: 'https://tm.injective.network',
        rest: 'https://lcd.injective.network',
      }
    case TestnetCosmosChainId.Cosmoshub:
      return {
        rpc: 'https://testnet.tm.cosmos.injective.dev',
        rest: 'https://testnet.lcd.cosmos.injective.dev',
      }
    case TestnetCosmosChainId.Osmosis:
      return {
        rpc: 'https://rpc-test.osmosis.zone/',
        rest: 'https://lcd-test.osmosis.zone/',
      }
    default:
      throw new Error(`Endpoints for ${chainId} not found`)
  }
}

export const experimentalChainsConfig = {
  [TestnetCosmosChainId.Osmosis]: {
    ...getEndpointsFromChainId(TestnetCosmosChainId.Osmosis),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: 'osmo-test-4',
    chainName: 'Osmosis Testnet',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
    },
    walletUrl: 'https://wallet.keplr.app/#/cosmoshub/stake',
    walletUrlForStaking: 'https://wallet.keplr.app/#/cosmoshub/stake',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
    ],
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
  },
  [TestnetCosmosChainId.Cosmoshub]: {
    ...getEndpointsFromChainId(TestnetCosmosChainId.Cosmoshub),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: 'cosmoshub-testnet',
    chainName: 'Cosmos Testnet',
    stakeCurrency: {
      coinDenom: 'UPHOTON',
      coinMinimalDenom: 'uphoton',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
    },
    walletUrl: 'https://wallet.keplr.app/#/osmosis/stake',
    walletUrlForStaking: 'https://wallet.keplr.app/#/osmosis/stake',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'UPHOTON',
        coinMinimalDenom: 'uphoton',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'UPHOTON',
        coinMinimalDenom: 'uphoton',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    features: ['ibc-transfer'],
  },
  [CosmosChainId.Injective]: {
    ...getEndpointsFromChainId(CosmosChainId.Injective),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: 'injective-1',
    chainName: 'Injective - Beta',
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
    },
    walletUrl: 'https://hub.injective.network/',
    walletUrlForStaking: 'https://hub.injective.network/',
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config('inj'),
    currencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
      },
    ],
    gasPriceStep: {
      low: 5000000000,
      average: 25000000000,
      high: 40000000000,
    },
    features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign'],
    beta: true,
  },
} as Record<string, any>

export const getExperimentalChainConfigBasedOnChainId = (chainId: string): any | undefined =>
  experimentalChainsConfig[chainId]
