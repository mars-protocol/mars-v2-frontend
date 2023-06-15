import { TESTNET_VAULTS } from 'constants/vaults'
import { BN } from 'utils/helpers'

export const mockedDepositedVault: DepositedVault = {
  ...TESTNET_VAULTS[0],
  status: 'active',
  apy: 1,
  ltv: {
    max: 0.65,
    liq: 0.7,
  },
  amounts: {
    primary: BN(1),
    secondary: BN(1),
    locked: BN(1),
    unlocked: BN(1),
    unlocking: BN(1),
  },
  values: {
    primary: BN(0),
    secondary: BN(0),
  },
  cap: {
    denom: 'mock',
    max: 10,
    used: 1,
  },
}
