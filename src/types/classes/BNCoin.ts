import { ActionCoin } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { BN } from 'utils/helpers'

export class BNCoin {
  static fromDenom(denom: string, arg1: string): BNCoin {
    throw new Error('Method not implemented.')
  }
  public denom: string
  public amount: BigNumber

  constructor(coin: Coin) {
    this.denom = coin.denom
    this.amount = BN(coin.amount)
  }

  static fromDenomAndBigNumber(denom: string, amount: BigNumber) {
    return new BNCoin({ denom, amount: amount.toString() })
  }
  static fromCoin(coin: Coin) {
    return new BNCoin({ denom: coin.denom, amount: coin.amount.toString() })
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

  toSignedCoin(): any {
    return {
      denom: this.denom,
      size: this.amount.toString(),
    }
  }
}
