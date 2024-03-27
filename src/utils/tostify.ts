import { compareAccounts } from 'utils/accounts'

export function toastify(
  account: Account,
  updatedAccount: Account,
  response: BroadcastResult,
  isV1: boolean,
  isSwap?: boolean,
) {
  const usedAccount = isV1 ? `Credit Account ${account.id}` : 'Red Bank'
  const accountDifferences = compareAccounts(account, updatedAccount)

  // SCENARIOS

  /*  
    Deposit 
        - Deposits increased 

    Deposit and Lend 
        - Lends increased 

    Lend 
        - Deposits decreased
        - Lends increased    

    Withdraw 
        - Deposits or Lends decreased 

    Borrow 
        - Debts increased
        - Deposits or Lends increased

    Borrow to Wallet
        - Debts increased    

    Repay
        - Debts decreased
        - Deposits or Lends decreased
        
    Repay from Wallet
        - Debts decreased
        
    Deposit to Vault
        - Vaults increased

    Withdraw from Vault
        - Vaults decreased

    Request unlock from Vault
        - Vaults unlocking increased

    Swap
        - 1 Deposit or Lend position increased
        - 1 Deposit or Lend position decreased
        - isSwap = true

    Margin Swap
        - 1 Deposit or Lend position increased
        - optional: 1 Deposit or Lend position decreased
        - 1 Debt position increased
        - isSwap = true

    Margin Swap and repay
        - 1 Deposit or Lend position increased
        - optional: 1 Deposit or Lend position decreased
        - 1 Debt position increased
        - 1 Debt position decreased
        - isSwap = true

    Swap and Repay
        - 1 Deposit or Lend position increased
        - 1 Deposit or Lend position decreased
        - 1 Debt position decreased
        - isSwap = true

    Open Perps Position    
        - Perps increased

    Close Perps Position
        - Perps decreased

    Increase Perps Long Position
        - 1 positive Perp position increased

    Decrease Perps Long Position
        - 1 positive Perp position decreased and still positive

    Change Perps from Long to Short Position
        - 1 positive Perp position decreased and now negative
    
    Change Perps from Short to Long Position
        - 1 negative Perp position decreased and now positive
        
    Decrease Perps Short Position
        - 1 negative Perp position decreased and still negative

    */

  /* LEGACY


        if (toast.swapOptions) {
          const coinOut = getTokenOutFromSwapResponse(response, toast.swapOptions.denomOut)

          if (toast.options.action === 'swap') {
            if (!toast.options.changes) toast.options.changes = {}
            toast.options.changes.swap = {
              from: toast.swapOptions.coinIn.toCoin(),
              to: getTokenOutFromSwapResponse(response, toast.swapOptions.denomOut),
            }
            if (toast.options.repay) toast.options.changes.repays = [BNCoin.fromCoin(coinOut)]
          }

          if (toast.options.action === 'hls-staking') {
            const depositAmount: BigNumber = toast.options.changes?.deposits?.length
              ? toast.options.changes.deposits[0].amount
              : BN_ZERO

            coinOut.amount = depositAmount.plus(coinOut.amount).toFixed(0)
            toast.options.message = `Added ${formatAmountWithSymbol(
              coinOut,
              get().chainConfig.assets,
            )}`
          }
        }


if (!changes) return

    switch (action) {
      case 'borrow':
        const borrowCoin = changes.debts ? [changes.debts[0].toCoin()] : []
        const borrowAction = lend ? 'Borrowed and lent' : 'Borrowed'
        toast.content.push({
          coins: borrowCoin,
          text: target === 'wallet' ? 'Borrowed to wallet' : borrowAction,
        })
        break

      case 'withdraw':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: target === 'wallet' ? 'Withdrew to Wallet' : 'Unlent',
        })
        break

      case 'deposit':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: lend ? 'Deposited and lent' : 'Deposited',
        })
        break

      case 'lend':
        const lendCoin = changes.lends ? [changes.lends[0].toCoin()] : []
        toast.content.push({
          coins: lendCoin,
          text: 'Lent',
        })
        break

      case 'repay':
        const repayCoin = changes.deposits ? [changes.deposits[0].toCoin()] : []
        toast.content.push({
          coins: repayCoin,
          text: 'Repaid',
        })
        break

      case 'open-perp':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: 'Market order executed',
        })
        break
      case 'close-perp':
        // TODO: [Perps] Elaborate on the message
        toast.content.push({
          coins: [],
          text: 'Closed perp position',
        })
        break
      case 'modify-perp':
        toast.content.push({
          coins: [],
          text: 'Modified perp position',
        })
        break
      // TODO: Finetune the messages
      case 'perp-vault-deposit':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],

          text: 'Deposited into perp vault',
        })
        break
      case 'perp-vault-unlock':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: 'Deposited into perp vault',
        })
        break
      case 'perp-vault-withdraw':
        toast.content.push({
          coins: changes.deposits?.map((deposit) => deposit.toCoin()) ?? [],
          text: 'Deposited into perp vault',
        })
        break
      case 'swap':
        if (changes.debts) {
          toast.content.push({
            coins: [changes.debts[0].toCoin()],
            text: 'Borrowed',
          })
        }
        if (changes.reclaims) {
          toast.content.push({
            coins: [changes.reclaims[0].toCoin()],
            text: 'Unlent',
          })
        }
        if (changes.swap) {
          toast.content.push({
            coins: [changes.swap.from, changes.swap.to],
            text: 'Swapped',
          })
        }
        if (changes.repays) {
          toast.content.push({
            coins: [changes.repays[0].toCoin()],
            text: 'Repaid',
          })
        }
        break

      case 'vault':
      case 'vaultCreate':
        toast.content.push({
          coins: changes.deposits?.map((debt) => debt.toCoin()) ?? [],
          text: action === 'vaultCreate' ? 'Created a Vault Position' : 'Added to Vault Position',
        })
        break
    }

        */
}
