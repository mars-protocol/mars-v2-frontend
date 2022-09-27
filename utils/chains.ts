export const chainsInfo = {
  Injective: {
    chainId: 'injective-1',
    rpc: 'https://tm.injective.network',
    rest: 'https://lcd.injective.network',
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
      coinImageUrl: '/tokens/injective.svg',
    },
    // works
    // rest: "https://lcd.injective.network",
  },
  InjectiveTestnet: {
    chainId: 'injective-888',
    // need to check
    rpc: 'https://testnet.tm.injective.dev',
    rest: 'https://testnet.lcd.injective.dev',
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
      coinImageUrl: '/tokens/injective.svg',
    },
  },
  Osmosis: {
    chainId: 'osmosis-1',
    rpc: 'https://rpc.osmosis.zone',
    rest: 'https://lcd.osmosis.zone',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinImageUrl: '/tokens/osmo.svg',
    },
  },
  OsmosisTestnet: {
    chainId: 'osmo-test-4',
    rpc: 'https://rpc-test.osmosis.zone',
    rest: 'https://lcd-test.osmosis.zone',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinImageUrl: '/tokens/osmo.svg',
    },
  },
}

export const chain = chainsInfo.OsmosisTestnet
