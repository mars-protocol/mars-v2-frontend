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
            exact: this.amount.integerValue().toString(),
          },
    }
  }

  toSignedCoin(): any {
    return {
      denom: this.denom,
      size: this.amount.integerValue().toString(),
    }
  }

  toPnLCoin(): PnL {
    if (this.amount.isZero()) {
      return 'break_even'
    }

    if (this.amount.isPositive()) {
      return {
        profit: this.toCoin(),
      }
    }

    return {
      loss: this.abs().toCoin(),
    }
  }

  abs() {
    return BNCoin.fromDenomAndBigNumber(this.denom, this.amount.abs())
  }

  integerValue() {
    return BNCoin.fromDenomAndBigNumber(this.denom, this.amount.integerValue())
  }

  plus(amount: BigNumber) {
    return BNCoin.fromDenomAndBigNumber(this.denom, this.amount.plus(amount))
  }

  negated() {
    return BNCoin.fromDenomAndBigNumber(this.denom, this.amount.negated())
  }
}
