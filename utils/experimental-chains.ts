import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  ChainId,
  CosmosChainId,
  DevnetCosmosChainId,
  TestnetCosmosChainId,
} from "types";

export const getEndpointsFromChainId = (
  chainId: TestnetCosmosChainId | CosmosChainId | ChainId | DevnetCosmosChainId
): { rpc: string; rest: string } => {
  switch (chainId) {
    case CosmosChainId.Cosmoshub:
      return {
        rpc: "https://tm.cosmos.injective.network",
        rest: "https://lcd.cosmos.injective.network",
      };
    case CosmosChainId.Osmosis:
      return {
        rpc: "https://tm.osmosis.injective.network",
        rest: "https://lcd.osmosis.injective.network",
      };
    case CosmosChainId.Injective:
      return {
        rpc: "https://tm.injective.network",
        rest: "https://lcd.injective.network",
      };
    case CosmosChainId.Juno:
      return {
        rpc: "https://tm.juno.injective.network",
        rest: "https://lcd.juno.injective.network",
      };
    case CosmosChainId.Terra:
      return {
        rpc: "https://tm.terra.injective.network",
        rest: "https://lcd.terra.injective.network",
      };
    case CosmosChainId.TerraUST:
      return {
        rpc: "https://tm.terra.injective.network",
        rest: "https://lcd.terra.injective.network",
      };
    case TestnetCosmosChainId.Cosmoshub:
      return {
        rpc: "https://testnet.tm.cosmos.injective.dev",
        rest: "https://testnet.lcd.cosmos.injective.dev",
      };
    case TestnetCosmosChainId.Injective:
      return {
        rpc: "https://testnet.tm.injective.dev",
        rest: "https://testnet.lcd.injective.dev",
      };
    case DevnetCosmosChainId.Injective:
      return {
        rpc: "https://devnet.tm.injective.dev",
        rest: "https://devnet.lcd.injective.dev",
      };
    case CosmosChainId.Chihuahua:
      return {
        rpc: "https://rpc.chihuahua.wtf",
        rest: "https://api.chihuahua.wtf",
      };
    case CosmosChainId.Axelar:
      return {
        rpc: "https://tm.axelar.injective.network",
        rest: "https://lcd.axelar.injective.network",
      };
    case CosmosChainId.Evmos:
      return {
        rpc: "https://tm.evmos.injective.network",
        rest: "https://lcd.evmos.injective.network",
      };
    case CosmosChainId.Persistence:
      return {
        rpc: "https://tm.persistence.injective.network",
        rest: "https://lcd.persistence.injective.network",
      };
    case CosmosChainId.Secret:
      return {
        rpc: "https://tm.secret.injective.network",
        rest: "https://lcd.secret.injective.network",
      };
    case CosmosChainId.Stride:
      return {
        rpc: "https://tm.stride.injective.network",
        rest: "https://lcd.stride.injective.network",
      };
    default:
      throw new Error(`Endpoints for ${chainId} not found`);
  }
};

export const experimentalChainsConfig = {
  [TestnetCosmosChainId.Cosmoshub]: {
    ...getEndpointsFromChainId(TestnetCosmosChainId.Cosmoshub),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: "cosmoshub-testnet",
    chainName: "Cosmos Testnet",
    stakeCurrency: {
      coinDenom: "UPHOTON",
      coinMinimalDenom: "uphoton",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl: "https://wallet.keplr.app/#/cosmoshub/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "UPHOTON",
        coinMinimalDenom: "uphoton",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "UPHOTON",
        coinMinimalDenom: "uphoton",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    coinType: 118,
    features: ["ibc-transfer"],
  },
  [TestnetCosmosChainId.Injective]: {
    ...getEndpointsFromChainId(TestnetCosmosChainId.Injective),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: "injective-888",
    chainName: "Injective Testnet",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    walletUrl: "https://hub.injective.dev/",
    walletUrlForStaking: "https://hub.injective.dev/",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    gasPriceStep: {
      low: 5000000000,
      average: 25000000000,
      high: 40000000000,
    },
    coinType: 60,
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  [DevnetCosmosChainId.Injective]: {
    ...getEndpointsFromChainId(DevnetCosmosChainId.Injective),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: "injective-777",
    chainName: "Injective - Devnet",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    walletUrl: "https://hub.injective.dev/",
    walletUrlForStaking: "https://hub.injective.dev/",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    gasPriceStep: {
      low: 5000000000,
      average: 25000000000,
      high: 40000000000,
    },
    coinType: 60,
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
  },
  [CosmosChainId.Injective]: {
    ...getEndpointsFromChainId(CosmosChainId.Injective),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: "injective-1",
    chainName: "Injective - Beta",
    stakeCurrency: {
      coinDenom: "INJ",
      coinMinimalDenom: "inj",
      coinDecimals: 18,
      coinGeckoId: "injective-protocol",
    },
    walletUrl: "https://hub.injective.network/",
    walletUrlForStaking: "https://hub.injective.network/",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("inj"),
    currencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "INJ",
        coinMinimalDenom: "inj",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
      },
    ],
    gasPriceStep: {
      low: 5000000000,
      average: 25000000000,
      high: 40000000000,
    },
    features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    beta: true,
  },
  [CosmosChainId.Terra]: {
    ...getEndpointsFromChainId(CosmosChainId.Terra),
    rpcConfig: undefined,
    restConfig: undefined,
    chainId: "columbus-5",
    chainName: "Terra",
    stakeCurrency: {
      coinDenom: "LUNA",
      coinMinimalDenom: "uluna",
      coinDecimals: 6,
      coinGeckoId: "terra-luna",
    },
    walletUrl: "https://station.terra.money/wallet",
    walletUrlForStaking: "https://station.terra.money/wallet",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("terra"),
    currencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinGeckoId: "terrausd",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LUNA",
        coinMinimalDenom: "uluna",
        coinGeckoId: "terra-luna",
        coinDecimals: 6,
      },
      {
        coinDenom: "UST",
        coinMinimalDenom: "uusd",
        coinGeckoId: "terrausd",
        coinDecimals: 6,
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0.01,
      average: 0.3,
      high: 0.04,
    },
    features: ["ibc-transfer"],
  },
  [CosmosChainId.Chihuahua]: {
    ...getEndpointsFromChainId(CosmosChainId.Chihuahua),
    chainId: "chihuahua-1",
    chainName: "Chihuahua",
    stakeCurrency: {
      coinDenom: "HUAHUA",
      coinMinimalDenom: "uhuahua",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("chihuahua"),
    currencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.035,
    },
    features: ["ibc-transfer", "ibc-go"],
  },
} as Record<string, any>;

export const getExperimentalChainConfigBasedOnChainId = (
  chainId: string
): any | undefined => experimentalChainsConfig[chainId];
