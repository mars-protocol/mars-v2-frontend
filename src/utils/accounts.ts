import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'

export const calculateAccountBalance = (position: Position, prices: Coin[]) => {
  let totalDepositValue = new BigNumber(0)
  let totalDebtValue = new BigNumber(0)

  position.deposits.map((depositPosition) => {
    const priceObject = prices.find((priceObject) => priceObject.denom === depositPosition.denom)
    const assetPrice = new BigNumber(priceObject?.amount || 0)
    const depositPositionValue = new BigNumber(depositPosition.amount).multipliedBy(assetPrice)
    totalDepositValue = totalDepositValue.plus(depositPositionValue)
  })

  position.debts.map((debtPosition) => {
    const priceObject = prices.find((priceObject) => priceObject.denom === debtPosition.denom)
    const assetPrice = new BigNumber(priceObject?.amount || 0)
    const debtPositionValue = new BigNumber(debtPosition.amount).multipliedBy(assetPrice)
    totalDebtValue = totalDebtValue.plus(debtPositionValue)
  })

  return totalDepositValue.minus(totalDebtValue).toNumber()
}
