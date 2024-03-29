import moment from 'moment'
import { analizeTransaction } from 'utils/broadcast'

export function generateToast(
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
  address: string,
): ToastResponse {
  const { target, transactionType, recipient, txCoins } = analizeTransaction(result, address)
  const toast = {
    id: toastOptions?.id ?? moment().unix(),
    timestamp: toastOptions?.id ?? moment().unix(),
    address,
    isError: false,
    hash: result.result?.hash ?? '',
    target,
    content: [] as ToastContent[],
    message: toastOptions?.message,
  }

  switch (transactionType) {
    case 'create':
      toast.message = 'Created the Credit Account'
      break

    case 'transaction':
      toast.content.push({
        text: 'Borrowed',
        coins: txCoins.borrow,
      })
      toast.content.push({
        text: 'Unlent',
        coins: txCoins.reclaim,
      })
      toast.content.push({
        text: 'Withdrew to Wallet',
        coins: txCoins.withdraw,
      })
      toast.content.push({
        text: 'Swapped',
        coins: txCoins.swap,
      })
      toast.content.push({
        text: 'Deposited',
        coins: txCoins.deposit,
      })
      toast.content.push({
        text: 'Repaid',
        coins: txCoins.repay,
      })
      toast.content.push({
        text: target === 'Red Bank' ? 'Deposited' : 'Lent',
        coins: txCoins.lend,
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
