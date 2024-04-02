import moment from 'moment'

import getAccount from 'api/accounts/getAccount'
import { analizeTransaction } from 'utils/broadcast'

export async function generateToast(
  chainConfig: ChainConfig,
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
  address: string,
): Promise<ToastResponse> {
  const { target, transactionType, recipient, txCoins } = await analizeTransaction(
    chainConfig,
    result,
    address,
  )
  const isHLS = target.split(' ')[0] === 'HLS'

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
      toast.message = 'Minted the Account'
      break

    case 'transaction':
      if (isHLS && txCoins.deposit.length === 2) {
        toast.content.push({
          text: 'Deposited from Wallet',
          coins: [txCoins.deposit[0]],
        })
      }
      toast.content.push({
        text: 'Borrowed',
        coins: txCoins.borrow,
      })
      toast.content.push({
        text: 'Unlent',
        coins: txCoins.reclaim,
      })
      toast.content.push({
        text: 'Swapped',
        coins: txCoins.swap,
      })
      if (isHLS && txCoins.deposit.length === 2) {
        toast.content.push({
          text: 'Deposited into HLS Account',
          coins: [txCoins.deposit[1]],
        })
      } else {
        toast.content.push({
          text: 'Deposited',
          coins: txCoins.deposit,
        })
      }
      toast.content.push({
        text: 'Repaid',
        coins: txCoins.repay,
      })
      toast.content.push({
        text: target === 'Red Bank' ? 'Deposited' : 'Lent',
        coins: txCoins.lend,
      })
      toast.content.push({
        text: 'Withdrew to Wallet',
        coins: txCoins.withdraw,
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
