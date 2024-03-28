import { getTransactionTarget, identifyTransactionType } from 'utils/broadcast'

export function toastify(
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
  address: string,
): ToastResponse {
  const target = getTransactionTarget(result)
  const transactionType = identifyTransactionType(result)
  const toast = {
    id: toastOptions?.id ?? Date.now(),
    timestamp: toastOptions?.id ?? Date.now(),
    address,
    isError: false,
    hash: result.result?.hash ?? '',
    target,
    content: [] as { coins: Coin[]; text: string }[],
    message: toastOptions?.message,
  }

  const recipient = 'wallet' // TODO get recipient
  const txCoins = [] as {
    coins: Coin[]
    type: 'borrow' | 'lend' | 'withdraw' | 'reclaim' | 'deposit' | 'repay' | 'swap' | 'repay'
  }[] // TODO get coins

  switch (transactionType) {
    case 'create':
      toast.message = 'Created the Credit Account'
      break

    case 'borrow':
      toast.content.push({
        text: 'Borrowed',
        coins: txCoins.find((c) => c.type === 'borrow')?.coins ?? [],
      })
      toast.content.push({
        text: 'Lent',
        coins: txCoins.find((c) => c.type === 'lend')?.coins ?? [],
      })
      break

    case 'withdraw':
      toast.content.push({
        text: recipient === 'wallet' ? 'Withdrew to Wallet' : 'Unlent',
        coins:
          txCoins.find((c) =>
            recipient === 'wallet' ? c.type === 'withdraw' : c.type === 'reclaim',
          )?.coins ?? [],
      })
      break

    case 'deposit':
      toast.content.push({
        text: 'Deposited',
        coins: txCoins.find((c) => c.type === 'deposit')?.coins ?? [],
      })
      toast.content.push({
        text: 'Lent',
        coins: txCoins.find((c) => c.type === 'lend')?.coins ?? [],
      })
      break

    case 'lend':
      toast.content.push({
        text: 'Lent',
        coins: txCoins.find((c) => c.type === 'lend')?.coins ?? [],
      })
      break

    case 'repay':
      toast.content.push({
        text: 'Repaid',
        coins: txCoins.find((c) => c.type === 'repay')?.coins ?? [],
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
        coins: txCoins.find((c) => c.type === 'borrow')?.coins ?? [],
      })

      toast.content.push({
        text: 'Unlent',
        coins: txCoins.find((c) => c.type === 'reclaim')?.coins ?? [],
      })

      toast.content.push({
        text: 'Swapped',
        coins: txCoins.find((c) => c.type === 'swap')?.coins ?? [],
      })

      toast.content.push({
        text: 'Repaid',
        coins: txCoins.find((c) => c.type === 'repay')?.coins ?? [],
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
