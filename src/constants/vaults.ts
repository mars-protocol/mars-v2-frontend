import { BN_ZERO } from 'constants/math'

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
    isFeatured: false,
  },
  {
    address: 'osmo1jfmwayj8jqp9tfy4v4eks5c2jpnqdumn8x8xvfllng0wfes770qqp7jl4j',
    name: 'OSMO-USDC.axl',
    lockup: {
      duration: 14,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
      lp: 'gamm/pool/678',
      vault: 'factory/osmo1jfmwayj8jqp9tfy4v4eks5c2jpnqdumn8x8xvfllng0wfes770qqp7jl4j/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'USDC.axl',
    },
    isFeatured: false,
  },
  {
    address: 'osmo1a6tcf60pyz8qq2n532dzcs7s7sj8klcmra04tvaqympzcvxqg9esn7xz7l',
    name: 'stATOM-ATOM',
    lockup: {
      duration: 14,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lp: 'gamm/pool/803',
      vault: 'factory/osmo1a6tcf60pyz8qq2n532dzcs7s7sj8klcmra04tvaqympzcvxqg9esn7xz7l/cwVTT',
    },
    symbols: {
      primary: 'stATOM',
      secondary: 'ATOM',
    },
    isFeatured: false,
    isHls: true,
  },
  {
    address: 'osmo185gqewrlde8vrqw7j8lpad67v8jfrx9u7770k9q87tqqecctp5tq50wt2c',
    name: 'OSMO-WBTC.axl',
    lockup: {
      duration: 14,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F',
      lp: 'gamm/pool/712',
      vault: 'factory/osmo185gqewrlde8vrqw7j8lpad67v8jfrx9u7770k9q87tqqecctp5tq50wt2c/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'WBTC.axl',
    },
    isFeatured: false,
  },
  {
    address: 'osmo1r235f4tdkwrsnj3mdm9hf647l754y6g6xsmz0nas5r4vr5tda3qsgtftef',
    name: 'OSMO-WETH.axl',
    lockup: {
      duration: 14,
      timeframe: 'days',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
      lp: 'gamm/pool/704',
      vault: 'factory/osmo1r235f4tdkwrsnj3mdm9hf647l754y6g6xsmz0nas5r4vr5tda3qsgtftef/cwVTT',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'WETH.axl',
    },
    isFeatured: false,
  },
]

export const MOCK_DEPOSITED_VAULT_POSITION = {
  status: 'active' as VaultStatus,
  type: 'normal' as VaultType,
  lockup: {
    duration: 0,
    timeframe: '',
  },
  amounts: {
    primary: BN_ZERO,
    secondary: BN_ZERO,
    locked: BN_ZERO,
    unlocked: BN_ZERO,
    unlocking: BN_ZERO,
  },
}
