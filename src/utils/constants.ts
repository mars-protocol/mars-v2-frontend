export const defaultFee: StdFee = {
  amount: [
    {
      denom: 'uosmo',
      amount: '100000',
    },
  ],
  gas: '10000000',
}

export const SECONDS_IN_A_YEAR = 31540000

export const LTV_BUFFER = 0.01

export const DEPOSIT_CAP_BUFFER = 0.999
export const VAULT_DEPOSIT_BUFFER = 0.9999