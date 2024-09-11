import moment from 'moment'

import { analizeTransaction, getToastContentsFromGroupedTransactionCoin } from './broadcast'

export async function generateToast(
  chainConfig: ChainConfig,
  result: BroadcastResult,
  toastOptions: Partial<ToastObjectOptions>,
  address: string,
  assets: Asset[],
): Promise<ToastResponse> {
  const { target, isHls, transactionType, txCoinGroups } = await analizeTransaction(
    chainConfig,
    result,
    address,
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
