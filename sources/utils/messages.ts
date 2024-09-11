import { formatAmountWithSymbol } from './formatters'

export function getNoBalanceMessage(symbol: string) {
  return `You don't have an ${symbol} balance in your account.`
}

export function getNoBalanceInWalletMessage(symbol: string) {
  return `You don't have any ${symbol} in your wallet.`
}

export function getDepositCapMessage(
  denom: string,
  amount: BigNumber,
  action: 'deposit' | 'borrow',
  assets: Asset[],
) {
  return `You cannot ${action} more than ${formatAmountWithSymbol(
    {
      denom,
      amount: amount.toString(),
    },
    assets,
  )} due to the deposit cap on this asset being reached in the protocol.`
}

export function getLiquidityMessage(denom: string, amount: BigNumber, assets: Asset[]) {
  return `You cannot borrow more than ${formatAmountWithSymbol(
    {
      denom,
      amount: amount.toString(),
    },
    assets,
  )} due to the available market liquidity.`
}

export function getHealthFactorMessage(
  denom: string,
  amount: BigNumber,
  action: 'borrow' | 'withdraw',
  assets: Asset[],
) {
  return `You cannot ${action} more than ${formatAmountWithSymbol(
    {
      denom,
      amount: amount.toString(),
    },
    assets,
  )}, as it will likely result in a health factor lower than 1.`
}
