// ENUMS
export enum EthereumChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  Injective = 888,
  Ganache = 1337,
  HardHat = 31337,
}

export enum ChainId {
  Mainnet = 'injective-1',
  Testnet = 'injective-888',
  Devnet = 'injective-777',
}

export enum Wallet {
  Metamask = 'metamask',
  Ledger = 'ledger',
  LedgerLegacy = 'ledger-legacy',
  Trezor = 'trezor',
  Keplr = 'keplr',
  Torus = 'torus',
  WalletConnect = 'wallet-connect',
}

// COSMOS
export enum CosmosChainId {
  Injective = 'injective-1',
  Cosmoshub = 'cosmoshub-4',
  Juno = 'juno-1',
  Osmosis = 'osmosis-1',
  Terra = 'columbus-5',
  TerraUST = 'columbus-5',
  Chihuahua = 'chihuahua-1',
  Axelar = 'axelar-dojo-1',
  Evmos = 'evmos_9001-2',
  Persistence = 'core-1',
  Secret = 'secret-4',
  Stride = 'stride-1',
}

export enum TestnetCosmosChainId {
  Injective = 'injective-888',
  Cosmoshub = 'cosmoshub-testnet',
}

export enum DevnetCosmosChainId {
  Injective = 'injective-777',
  Injective1 = 'injective-777',
}
