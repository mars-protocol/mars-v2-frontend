import { BNCoin } from 'types/classes/BNCoin'

export class WrappedBNCoin {
  public coin: BNCoin
  public chain?: string

  constructor(coin: BNCoin, chain?: string) {
    this.coin = coin
    this.chain = chain
  }

  static fromBNCoin(coin: BNCoin, chain?: string): WrappedBNCoin {
    return new WrappedBNCoin(coin, chain)
  }

  static fromDenomAndBigNumber(denom: string, amount: BigNumber, chain?: string): WrappedBNCoin {
    return new WrappedBNCoin(BNCoin.fromDenomAndBigNumber(denom, amount), chain)
  }

  static fromCoin(coin: Coin, chain?: string): WrappedBNCoin {
    return new WrappedBNCoin(BNCoin.fromCoin(coin), chain)
  }

  toCoin(): Coin & { chainName?: string } {
    const baseCoin = this.coin.toCoin()
    return {
      ...baseCoin,
      chainName: this.chain || undefined,
    }
  }
}
