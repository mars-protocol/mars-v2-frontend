export enum DocURL {
  BORROW_LENDING_URL = 'https://docs.marsprotocol.io/lending-and-borrowing',
  FEATURE_URL = 'https://github.com/mars-protocol/mars-v2-frontend/releases/tag/',
  COOKIE_POLICY_URL = 'https://docs.marsprotocol.io/legal/cookie-policy',
  COUNCIL = 'https://daodao.zone/dao/neutron1pxjszcmmdxwtw9kv533u3hcudl6qahsa42chcs24gervf4ge40usaw3pcr/home',
  DOCS_URL = 'https://docs.marsprotocol.io/',
  FARM_INTRO_URL = 'https://docs.marsprotocol.io/leveraged-yield-farming',
  HLS_INTRO_URL = 'https://docs.marsprotocol.io/high-leverage-strategies',
  MANAGE_ACCOUNT_URL = 'https://docs.marsprotocol.io/getting-started/using-a-credit-account',
  ROVER_INTRO_URL = 'https://docs.marsprotocol.io/credit-accounts',
  PRIVACY_POLICY_URL = 'https://docs.marsprotocol.io/legal/privacy-policy',
  TERMS_OF_SERVICE_URL = 'https://docs.marsprotocol.io/legal/terms-of-service',
  TRADING_INTRO_URL = 'https://docs.marsprotocol.io/spot-and-margin-trading',
  WALLET_INTRO_URL = 'https://docs.marsprotocol.io/getting-started/how-to-set-up-a-wallet',
  X_SHARE_URL = 'https://x.com/intent/tweet',
  PERPS_VAULT_URL = 'https://docs.marsprotocol.io/perpetual-futures-perps/perps-vault-counterparty-vault',
  PERPS_INTRO_URL = 'https://docs.marsprotocol.io/perpetual-futures-perps',
  GET_STARTED_URL = 'https://docs.marsprotocol.io/getting-started',
  MANAGE_VAULT_URL = 'https://docs.marsprotocol.io/managed-vaults',
  PERFORMANCE_FEES_URL = 'https://docs.marsprotocol.io/managed-vaults#performance-fee',
  CREATE_VAULT_URL = 'https://docs.marsprotocol.io/managed-vaults/creating-a-vault',
  RECOVER_VAULT_ADDRESS_URL = 'https://docs.marsprotocol.io/managed-vaults/creating-a-vault/how-to-resume-vault-creation-after-failed-transaction',
  STATS_URL = 'https://stats.marsprotocol.io',
  TOKENOMICS_URL = 'https://stats.marsprotocol.io/tokenomics',
  FRAGMENTS_LEADERBOARD_URL = 'https://fragments.marsprotocol.io',
  TELEGRAM_URL = 'https://t.me/marsprotocol',
  DISCORD_URL = 'https://discord.marsprotocol.io/',
  X_URL = 'https://x.com/mars_protocol',
}

export enum NETWORK {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export enum SearchParams {
  ACCOUNT_ID = 'accountId',
  PERPS_MARKET = 'perpsMarket',
}

export enum VaultStatus {
  ACTIVE = 'active',
  UNLOCKING = 'unlocking',
  UNLOCKED = 'unlocked',
}

export enum WalletID {
  Cosmostation = 'cosmostation',
  CosmostationMobile = 'mobile-cosmostation',
  Keplr = 'keplr',
  KeplrMobile = 'mobile-keplr',
  Leap = 'leap-cosmos',
  LeapMobile = 'mobile-leap-cosmos',
  LeapSnap = 'leap-metamask-cosmos-snap',
  Station = 'station',
  Vectis = 'vectis-cosmos',
  Xdefi = 'xfi-cosmos',
  DaoDao = 'cosmiframe',
}

export enum ChainInfoID {
  Osmosis1 = 'osmosis-1',
  Pion1 = 'pion-1',
  Neutron1 = 'neutron-1',
}

export enum AstroportSwapPoolType {
  XYK = 'xyk',
  PCL = 'pcl',
}

export enum RewardsCenterType {
  Token = 'token',
  Position = 'position',
}

export enum OrderType {
  LIMIT = 'Limit',
  MARKET = 'Market',
  STOP = 'Stop',
}
