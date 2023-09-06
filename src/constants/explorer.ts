import { IS_TESTNET } from 'constants/env'

export const EXPLORER_NAME = 'Mintscan'
export const EXPLORER_TX_URL = IS_TESTNET
  ? 'https://testnet.mintscan.io/osmosis-testnet/txs/'
  : 'https://www.mintscan.io/osmosis/transactions/'
