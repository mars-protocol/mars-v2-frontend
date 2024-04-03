import moment from 'moment'

import { analizeTransaction } from 'utils/broadcast'
import { BN } from 'utils/helpers'
import { getVaultByDenoms } from 'utils/vaults'

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

  const vaultString =
    txCoins.vault.length === 2
      ? `Deposited into ${getVaultByDenoms(chainConfig, txCoins.vault)} Vault`
      : 'Deposit into Vault'

  switch (transactionType) {
    case 'execution':
      toast.message = 'Executed a Transaction'
      break

    case 'oracle':
      toast.message = 'Updated the Oracle Prices'
      break

    case 'create':
      toast.message = 'Minted the Account'
      break

    case 'burn':
      toast.message = 'Deleted the Account'
      break

    case 'unlock':
      toast.message = 'Started the unlock period of a vault position'
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
        text: vaultString,
        coins: txCoins.vault,
      })
      toast.content.push({
        text: target === 'Red Bank' ? 'Deposited' : 'Lent',
        coins: txCoins.lend,
      })
      toast.content.push({
        text: 'Withdrew to Wallet',
        coins: txCoins.withdraw,
      })

      if (txCoins.pnl.length > 0) {
        txCoins.pnl.forEach((coin) => {
          if (BN(coin.amount).isPositive()) {
            toast.content.push({
              text: 'Realised Profit',
              coins: [coin],
            })
          }
          if (BN(coin.amount).isNegative()) {
            toast.content.push({
              text: 'Covered Loss',
              coins: [{ denom: coin.denom, amount: BN(coin.amount).abs().toString() }],
            })
          }
        })
      }

      if (txCoins.perps.length > 0) {
        txCoins.perps.forEach((coin) => {
          if (BN(coin.amount).isGreaterThan(0)) {
            toast.content.push({
              text: 'Opened Perps Long Position',
              coins: [coin],
            })
          }
          if (BN(coin.amount).isZero()) {
            toast.message = 'Closed Perps Position'
          }
          if (BN(coin.amount).isNegative()) {
            toast.content.push({
              text: 'Opened Perps Short Position',
              coins: [{ denom: coin.denom, amount: BN(coin.amount).abs().toString() }],
            })
          }
        })
      }
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
        text: 'Withdrew from perp vault',
        coins: [], // TODO get coins
      })
      break
  }

  return toast
}
