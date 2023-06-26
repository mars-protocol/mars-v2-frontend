import { ActionCoin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { BN } from 'utils/helpers'

export class BNCoin {
  public denom: string
  public amount: BigNumber

  constructor(coin: Coin) {
    this.denom = coin.denom
    this.amount = BN(coin.amount)
  }

  static fromDenomAndBigNumber(denom: string, amount: BigNumber) {
    return new BNCoin({ denom, amount: amount.toString() })
  }

  toCoin(): Coin {
    return {
      denom: this.denom,
      amount: this.amount.toString(),
    }
  }

  toActionCoin(max?: boolean): ActionCoin {
    return {
      denom: this.denom,
      amount: max
        ? 'account_balance'
        : {
            exact: this.amount.toString(),
          },
    }
  }
}
