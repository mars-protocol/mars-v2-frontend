import BigNumber from 'bignumber.js'

export const calculateAccountBalance = (account: Account, prices: Coin[]) => {
  let totalDepositValue = new BigNumber(0)
  let totalDebtValue = new BigNumber(0)

  account.deposits.map((deposit) => {
    const priceObject = prices.find((priceObject) => priceObject.denom === deposit.denom)
    const assetPrice = new BigNumber(priceObject?.amount || 0)
    const depositValue = new BigNumber(deposit.amount).multipliedBy(assetPrice)
    totalDepositValue = totalDepositValue.plus(depositValue)
  })

  account.debts.map((debt) => {
    const priceObject = prices.find((priceObject) => priceObject.denom === debt.denom)
    const assetPrice = new BigNumber(priceObject?.amount || 0)
    const debtValue = new BigNumber(debt.amount).multipliedBy(assetPrice)
    totalDebtValue = totalDebtValue.plus(debtValue)
  })

  return totalDepositValue.minus(totalDebtValue).toNumber()
}
