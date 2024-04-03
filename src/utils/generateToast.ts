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
      ? `Deposited into the ${getVaultByDenoms(chainConfig, txCoins.vault)} vault`
      : 'Deposited into a vault'

  switch (transactionType) {
    case 'execution':
      toast.message = 'Executed a transaction'
      break

    case 'oracle':
      toast.message = 'Updated the oracle'
      break

    case 'create':
      toast.message = 'Minted the account'
      break

    case 'burn':
      toast.message = 'Deleted the account'
      break

    case 'unlock':
      toast.message = 'Started the unlock period of a vault position'
      break

    case 'transaction':
      if (isHLS && txCoins.deposit.length === 2) {
        toast.content.push({
          text: 'Deposited from wallet',
          coins: [txCoins.deposit[0]],
        })
      }
      toast.content.push({
        text: txCoins.perps.length ? 'Borrowed to cover fees' : 'Borrowed',
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
          text: 'Deposited into HLS account',
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
        text: 'Withdrew to wallet',
        coins: txCoins.withdraw,
      })

      if (txCoins.pnl.length > 0) {
        txCoins.pnl.forEach((coin) => {
          if (BN(coin.amount).isPositive()) {
            toast.content.push({
              text: 'Realised profit',
              coins: [coin],
            })
          }
          if (BN(coin.amount).isNegative()) {
            toast.content.push({
              text: 'Realised loss',
              coins: [{ denom: coin.denom, amount: BN(coin.amount).abs().toString() }],
            })
          }
        })
      }

      if (txCoins.perps.length > 0) {
        txCoins.perps.forEach((coin) => {
          if (BN(coin.amount).isGreaterThan(0)) {
            toast.content.push({
              text: 'Opened perps long position',
              coins: [coin],
            })
          }
          if (BN(coin.amount).isZero()) {
            toast.message = 'Closed perps position'
          }
          if (BN(coin.amount).isNegative()) {
            toast.content.push({
              text: 'Opened perps short position',
              coins: [{ denom: coin.denom, amount: BN(coin.amount).abs().toString() }],
            })
          }
        })
      }

      if (txCoins.perpsModify.length === 2) {
        toast.message = 'Modified perps position'
        const beforePosition = txCoins.perpsModify[0]
        const modification = txCoins.perpsModify[1]
        const positionType = BN(beforePosition.amount).isGreaterThan(0) ? 'long' : 'short'
        if (BN(modification.amount).isGreaterThan(0)) {
          toast.content.push({
            text: `Increased ${positionType} by`,
            coins: [modification],
          })
        }
        if (BN(modification.amount).isNegative()) {
          toast.content.push({
            text: `Decreased ${positionType} by`,
            coins: [
              { denom: modification.denom, amount: BN(modification.amount).abs().toString() },
            ],
          })
        }
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
