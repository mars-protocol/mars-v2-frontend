export enum DocURL {
  ADVANCED_TRADING_URL = 'https://docs.marsprotocol.io/docs/learn/mars-v2/trade/margin',
  BORROW_LENDING_URL = 'https://docs.marsprotocol.io/docs/learn/mars-v2/borrow',
  FEATURE_URL = 'https://github.com/mars-protocol/mars-v2-frontend/releases/tag/',
  COOKIE_POLICY_URL = 'https://docs.marsprotocol.io/docs/overview/legal/cookie-policy',
  COUNCIL = 'https://daodao.zone/dao/neutron1pxjszcmmdxwtw9kv533u3hcudl6qahsa42chcs24gervf4ge40usaw3pcr/home',
  DOCS_URL = 'https://docs.marsprotocol.io/',
  FARM_INTRO_URL = 'https://docs.marsprotocol.io/docs/learn/tutorials/farming/farming-intro',
  HLS_INTRO_URL = 'https://docs.marsprotocol.io/docs/learn/mars-v2/high-leveraged-strategies/high-leveraged-strategies-intro',
  MANAGE_ACCOUNT_URL = 'https://docs.marsprotocol.io/docs/learn/tutorials/credit-accounts/credit-accounts-intro',
  ROVER_INTRO_URL = 'https://docs.marsprotocol.io/docs/learn/mars-v2/credit-accounts',
  PRIVACY_POLICY_URL = 'https://docs.marsprotocol.io/docs/overview/legal/privacy-policy',
  TERMS_OF_SERVICE_URL = 'https://docs.marsprotocol.io/docs/overview/legal/terms-of-service',
  TRADING_INTRO_URL = 'https://docs.marsprotocol.io/docs/learn/tutorials/trading/trading-intro',
  VAULT_TUTORIAL_URL = '',
  WALLET_INTRO_URL = 'https://docs.marsprotocol.io/docs/learn/tutorials/basics/connecting-your-wallet',
  X_SHARE_URL = 'https://x.com/intent/tweet',
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
