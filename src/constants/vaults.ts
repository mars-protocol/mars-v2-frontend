export const VAULT_DEPOSIT_BUFFER = 0.999

export const TESTNET_VAULTS_META_DATA: VaultMetaData[] = [
  {
    address: 'osmo1q40xvrzpldwq5he4ftsf7zm2jf80tj373qaven38yqrvhex8r9rs8n94kv',
    name: 'OSMO-USDC.n',
    lockup: {
      duration: 1,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lp: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    isFeatured: true,
  },
  {
    address: 'osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn',
    name: 'OSMO-USDC.n',
    lockup: {
      duration: 7,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lp: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    isFeatured: true,
  },
  {
    address: 'osmo1fmq9hw224fgz8lk48wyd0gfg028kvvzggt6c3zvnaqkw23x68cws5nd5em',
    name: 'OSMO-USDC.n',
    lockup: {
      duration: 14,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      lp: 'gamm/pool/6',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.n',
    },
    isFeatured: true,
  },
]

export const VAULTS_META_DATA: VaultMetaData[] = [
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
