import { IS_TESTNET } from './env'

export const VAULT_DEPOSIT_BUFFER = 0.999

export const VAULTS: VaultMetaData[] = [
  {
    address: IS_TESTNET
      ? 'osmo108q2krqr0y9g0rtesenvsw68sap2xefelwwjs0wedyvdl0cmrntqvllfjk'
      : 'osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp',
    name: 'OSMO-ATOM',
    lockup: {
      duration: 14,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lp: 'gamm/pool/1',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    isFeatured: true,
  },
]
