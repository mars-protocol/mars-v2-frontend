import { ENV } from 'constants/env'
import { NETWORK } from 'types/enums/network'

export const EXPLORER_NAME = 'Mintscan'
export const EXPLORER_TX_URL =
  ENV.NETWORK === NETWORK.TESTNET
    ? 'https://testnet.mintscan.io/osmosis-testnet/txs/'
    : 'https://www.mintscan.io/osmosis/transactions/'
