import { formatAmountWithSymbol } from 'utils/formatters'

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
) {
  return `You cannot ${action} more than ${formatAmountWithSymbol({
    denom,
    amount: amount.toString(),
  })} due to the deposit cap on this asset being reached in the protocol.`
}

export function getLiquidityMessage(denom: string, amount: BigNumber) {
  return `You cannot borrow more than ${formatAmountWithSymbol({
    denom,
    amount: amount.toString(),
  })} due to the available market liquidity.`
}

export function getHealthFactorMessage(
  denom: string,
  amount: BigNumber,
  action: 'borrow' | 'withdraw',
) {
  return `You cannot ${action} more than ${formatAmountWithSymbol({
    denom,
    amount: amount.toString(),
  })}, as it will likely result in a health factor lower than 1.`
}
