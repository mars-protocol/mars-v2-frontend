import { IS_TESTNET } from 'constants/env'

export const VAULT_DEPOSIT_BUFFER = 0.999

export const VAULTS: VaultMetaData[] = IS_TESTNET
  ? [
      {
        address: 'osmo1q40xvrzpldwq5he4ftsf7zm2jf80tj373qaven38yqrvhex8r9rs8n94kv',
        name: 'OSMO-USDC.axl',
        lockup: {
          duration: 1,
          timeframe: 'day',
        },
        provider: 'Apollo',
        denoms: {
          primary: 'uosmo',
          secondary: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
          lp: 'gamm/pool/1',
        },
        symbols: {
          primary: 'OSMO',
          secondary: 'USDC.axl',
        },
        isFeatured: true,
      },
      {
        address: 'osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn',
        name: 'OSMO-USDC.axl',
        lockup: {
          duration: 7,
          timeframe: 'days',
        },
        provider: 'Apollo',
        denoms: {
          primary: 'uosmo',
          secondary: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
          lp: 'gamm/pool/1',
        },
        symbols: {
          primary: 'OSMO',
          secondary: 'USDC.axl',
        },
        isFeatured: true,
      },
      {
        address: 'osmo1fmq9hw224fgz8lk48wyd0gfg028kvvzggt6c3zvnaqkw23x68cws5nd5em',
        name: 'OSMO-USDC.axl',
        lockup: {
          duration: 14,
          timeframe: 'days',
        },
        provider: 'Apollo',
        denoms: {
          primary: 'uosmo',
          secondary: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
          lp: 'gamm/pool/1',
        },
        symbols: {
          primary: 'OSMO',
          secondary: 'USDC.axl',
        },
        isFeatured: true,
      },
    ]
  : [
      // Mainnet Vaults
      {
        address: 'osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp',
        name: 'OSMO-ATOM',
        lockup: {
          duration: 14,
          timeframe: 'days',
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
