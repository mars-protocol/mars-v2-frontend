import { VaultStatus } from 'types/enums/vault'
import { BN_ZERO } from 'constants/math'

export const VAULT_DEPOSIT_BUFFER = 0.999

export const TESTNET_VAULTS_META_DATA: VaultMetaData[] = [
  {
    address: 'osmo1m45ap4rq4m2mfjkcqu9ks9mxmyx2hvx0cdca9sjmrg46q7lghzqqhxxup5',
    name: 'OSMO-ATOM',
    lockup: {
      duration: 1,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
      lp: 'gamm/pool/12',
      vault: 'factory/osmo1m45ap4rq4m2mfjkcqu9ks9mxmyx2hvx0cdca9sjmrg46q7lghzqqhxxup5/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    isFeatured: true,
  },
  {
    address: 'osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn',
    name: 'OSMO-USDC.axl',
    lockup: {
      duration: 7,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE',
      lp: 'gamm/pool/6',
      vault: 'factory/osmo14lu7m4ganxs20258dazafrjfaulmfxruq9n0r0th90gs46jk3tuqwfkqwn/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.axl',
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
      vault: 'factory/osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
    isFeatured: true,
  },
]

export const MOCK_DEPOSITED_VAULT_POSITION = {
  values: {
    primary: BN_ZERO,
    secondary: BN_ZERO,
  },
  amounts: {
    primary: BN_ZERO,
    secondary: BN_ZERO,
    locked: BN_ZERO,
    unlocked: BN_ZERO,
    unlocking: BN_ZERO,
  },
  status: VaultStatus.ACTIVE,
  apy: null,
  ltv: {
    liq: 0,
    max: 0,
  },
  cap: {
    denom: '',
    max: BN_ZERO,
    used: BN_ZERO,
  },
}
