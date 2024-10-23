import moment from 'moment'

import { analizeTransaction, getToastContentsFromGroupedTransactionCoin } from 'utils/broadcast'

export async function generateToast(
  chainConfig: ChainConfig,
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
  address: string,
  assets: Asset[],
  perpsBaseDenom?: string,
): Promise<ToastResponse> {
  const { target, isHls, transactionType, txCoinGroups } = await analizeTransaction(
    chainConfig,
    result,
    address,
    perpsBaseDenom,
  )

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
    case 'default':
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

    case 'cancel-order':
      toast.message = 'Canceled Limit Order'
      break

    case 'create-order':
      toast.message = 'Create Limit Order'
      break

    case 'unlock':
      toast.message = 'Started the unlock period of a vault position'
      break

    case 'transaction':
      txCoinGroups.forEach((txCoinGroup: GroupedTransactionCoin) => {
        const toastContents = getToastContentsFromGroupedTransactionCoin(
          txCoinGroup,
          isHls,
          target,
          chainConfig,
          assets,
        )
        toast.content.push(...toastContents)
      })
      break
  }

  return toast
}

export function beautifyErrorMessage(error: string) {
  if (error.includes('Cannot mint more than 1 account per wallet during trading competition'))
    return 'You can not mint more than 1 account per wallet during the trading competition.'

  if (error.includes('Deposit and withdraw actions are not allowed during trading competition'))
    return 'You can not deposit or withdraw funds during trading competition.'

  if (error.includes('Max LTV health factor'))
    return 'You can not execute this transaction, since it would result in a Health Factor below 1'

  if (error === 'Transaction failed: Request rejected') return 'Transaction rejected by user'

  return `Transaction failed: ${error}`
}
