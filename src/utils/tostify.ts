import { getTransactionTarget, identifyTransactionType } from 'utils/broadcast'

export function toastify(
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
): ToastResponse {
  const target = getTransactionTarget(result)
  const transactionType = identifyTransactionType(result)
  const toast = {
    id: toastOptions?.id ?? Date.now(),
    isError: false,
    hash: result.result?.hash ?? '',
    target,
    content: [] as { coins: Coin[]; text: string }[],
    message: toastOptions?.message,
  }

  const lend = false // TODO check for Lend
  const recipient = 'wallet' // TODO get recipient

  switch (transactionType) {
    case 'create':
      toast.message = 'Created the Credit Account'
      break

    case 'borrow':
      toast.content.push({
        text: lend ? 'Borrowed and lent' : 'Borrowed',
        coins: [], // TODO get coins
      })
      break

    case 'withdraw':
      toast.content.push({
        text: recipient === 'wallet' ? 'Withdrew to Wallet' : 'Unlent',
        coins: [], // TODO get coins
      })
      break

    case 'deposit':
      toast.content.push({
        text: lend ? 'Deposited and lent' : 'Deposited',
        coins: [], // TODO get coins
      })
      break

    case 'lend':
      toast.content.push({
        text: 'Lent',
        coins: [], // TODO get coins
      })
      break

    case 'repay':
      toast.content.push({
        text: 'Repaid',
        coins: [], // TODO get coins
      })
      break

    case 'open-perp':
      toast.content.push({
        text: 'Market order executed',
        coins: [], // TODO get coins
      })
      break

    case 'close-perp':
      toast.content.push({
        text: 'Closed perp position',
        coins: [], // TODO get coins
      })
      break

    case 'modify-perp':
      toast.content.push({
        text: 'Modified perp position',
        coins: [], // TODO get coins
      })
      break

    case 'perp-vault-deposit':
      toast.content.push({
        text: 'Deposited into perp vault',
        coins: [], // TODO get coins
      })
      break

    case 'perp-vault-unlock':
      toast.content.push({
        text: 'Deposited into perp vault',
        coins: [], // TODO get coins
      })
      break
    case 'perp-vault-withdraw':
      toast.content.push({
        text: 'Deposited into perp vault',
        coins: [], // TODO get coins
      })
      break
    case 'swap':
      toast.content.push({
        text: 'Borrowed',
        coins: [], // TODO get coins
      })

      toast.content.push({
        text: 'Unlent',
        coins: [], // TODO get coins
      })

      toast.content.push({
        text: 'Swapped',
        coins: [], // TODO get coins (from, to)
      })

      toast.content.push({
        text: 'Repaid',
        coins: [], // TODO get coins
      })
      break

    case 'vault':
    case 'vaultCreate':
      toast.content.push({
        text:
          transactionType === 'vaultCreate'
            ? 'Created a Vault Position'
            : 'Added to Vault Position',
        coins: [], // TODO get coins
      })
      break
  }

  return toast
}
