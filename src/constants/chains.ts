import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID } from 'types/enums/wallet'

export const CHAINS: ChainInfos = {
  [ChainInfoID.Osmosis1]: {
    rpc: 'https://rpc-osmosis.blockapsis.com',
    rest: 'https://lcd-osmosis.blockapsis.com',
    explorer: 'https://www.mintscan.io/osmosis',
    explorerName: 'Mintscan',
    chainId: ChainInfoID.Osmosis1,
    name: 'Osmosis',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [{ coinType: 330 }],
    gasPrice: '0.025uosmo',
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    defaultCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04,
      },
    },
    features: ['ibc-transfer', 'ibc-go'],
  },
  [ChainInfoID.OsmosisDevnet]: {
    rpc: 'https://rpc.devnet.osmosis.zone',
    rest: '	https://lcd.devnet.osmosis.zone',
    explorer: 'https://www.mintscan.io/osmosis',
    explorerName: 'Mintscan',
    chainId: ChainInfoID.OsmosisDevnet,
    name: 'Osmosis Devnet',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [{ coinType: 330 }],
    gasPrice: '0.025uosmo',
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    defaultCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04,
      },
    },
    features: ['ibc-transfer', 'ibc-go'],
  },
  [ChainInfoID.OsmosisTestnet]: {
    rpc: 'https://rpc.osmotest5.osmosis.zone',
    rest: 'https://lcd.osmotest5.osmosis.zone',
    explorer: 'https://testnet.mintscan.io/osmosis-testnet',
    explorerName: 'Mintscan',
    chainId: ChainInfoID.OsmosisTestnet,
    name: 'Osmosis Testnet',
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [{ coinType: 330 }],
    gasPrice: '0.025uosmo',
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    defaultCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04,
      },
    },
    features: ['ibc-transfer', 'ibc-go'],
  },
}
