import moment from 'moment'
import { mutate } from 'swr'

import {
  analizeTransaction,
  getCreditAccountIdFromBroadcastResult,
  getToastContentsAndMutationKeysFromGroupedTransactionCoin,
} from 'utils/broadcast'

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
  const accountId = getCreditAccountIdFromBroadcastResult(result)
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

  const mutationKeys = [] as string[]

  switch (transactionType) {
    case 'default':
      toast.message = 'Executed a transaction'
      break

    case 'oracle':
      toast.message = 'Updated the oracle'
      break

    case 'create':
      toast.message = 'Minted the account'
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/account-ids${!isHls ? '-without-hls' : ''}`,
      )
      if (isHls) mutationKeys.push(`##ADDRESS##/hlsStakingAccounts`)
      break

    case 'burn':
      toast.message = 'Deleted the account'
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/account-ids${!isHls ? '-without-hls' : ''}`,
      )
      if (isHls) mutationKeys.push(`##ADDRESS##/hlsStakingAccounts`)
      break

    case 'cancel-order':
      toast.message = 'Canceled a Limit Order'
      mutationKeys.push(`chains/${chainConfig.id}/perps/limit-orders/##ACCOUNTORWALLET##`)
      break

    case 'create-order':
      mutationKeys.push(`chains/${chainConfig.id}/perps/limit-orders/##ACCOUNTORWALLET##`)
      toast.message = 'Created a Limit Order'
      break

    case 'withdraw_from_vault':
      toast.message = 'Withdrew funds from a vault'
      mutationKeys.push(
        `chains/${chainConfig.id}/vaults/##ACCOUNTORWALLET##/deposited`,
        `chains/${chainConfig.id}/vaults`,
        `chains/${chainConfig.id}/vaults/aprs`,
        `chains/${chainConfig.id}/perps/vault`,
      )
      break

    case 'unlock':
      toast.message = 'Started the unlock period of a vault position'
      mutationKeys.push(
        `chains/${chainConfig.id}/vaults/##ACCOUNTORWALLET##/deposited`,
        `chains/${chainConfig.id}/vaults`,
        `chains/${chainConfig.id}/vaults/aprs`,
        `chains/${chainConfig.id}/perps/vault`,
      )
      break

    case 'transaction':
      txCoinGroups.forEach((txCoinGroup: GroupedTransactionCoin) => {
        const contentsAndKeys = getToastContentsAndMutationKeysFromGroupedTransactionCoin(
          txCoinGroup,
          isHls,
          target,
          chainConfig,
          assets,
          accountId,
        )
        toast.content.push(...contentsAndKeys.content)
        mutationKeys.push(...contentsAndKeys.mutationKeys)
      })
      break
  }

  const uniqueMutationKeys = [...new Set(mutationKeys)]

  uniqueMutationKeys.forEach(async (key) => {
    const accountToMutate = accountId ?? address
    let mutationKey = key.replaceAll('##ACCOUNTORWALLET##', accountToMutate)
    mutationKey = mutationKey.replaceAll('##ADDRESS##', address)
    await mutate(mutationKey)
    process.env.NODE_ENV !== 'production' && console.log('🔁 MUTATE: ', mutationKey)
  })

  return toast
}

export function beautifyErrorMessage(error: string) {
  console.error(error)
  if (error.includes('too old'))
    return 'The oracle prices are stale. Please wait until the prices in the oracle contract are updated again.'

  if (
    error.includes('Max LTV health factor') ||
    error.includes('Actions did not result in improved health factor')
  )
    return 'You can not execute this transaction, since it would result in a Health Factor below 1'

  if (error.includes('Generic Error')) return 'Generic Error. Please try again'

  if (error.includes('incorrect account sequence'))
    return 'You have a pending transaction. Wait for it to be executed and try again.'

  if (error.includes('OI reached'))
    return 'You can not execute this perp order, since it would exceed the maximum Open Interest for this market.'

  if (error === 'Transaction failed: Request rejected') return 'Transaction rejected by user'

  return `Transaction failed: ${error}`
}
