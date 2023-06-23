import { ActionCoin } from 'types/generated'

class AccountBalanceSettableCoin implements Coin {
  public denom: string
  public amount: string
  public setAccountBalance: boolean

  constructor(denom: string, amount: string, setAccountBalance: boolean) {
    this.denom = denom
    this.amount = amount
    this.setAccountBalance = setAccountBalance
  }

  toActionCoin(): ActionCoin {
    return {
      denom: this.denom,
      amount: this.setAccountBalance ? 'account_balance' : { exact: this.amount },
    }
  }
}

export default AccountBalanceSettableCoin
