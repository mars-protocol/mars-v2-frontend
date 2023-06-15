import { BN } from 'utils/helpers'

export class BNCoin {
  public denom: string
  public amount: BigNumber

  constructor(coin: Coin) {
    this.denom = coin.denom
    this.amount = BN(coin.amount)
  }

  toCoin(): Coin {
    return {
      denom: this.denom,
      amount: this.amount.toString(),
    }
  }
}
