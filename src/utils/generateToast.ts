import dayjs from 'utils/dayjs'
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
    assets,
    perpsBaseDenom,
  )
  const accountId = getCreditAccountIdFromBroadcastResult(result)
  const toast = {
    id: toastOptions?.id ?? dayjs().unix(),
    timestamp: toastOptions?.id ?? dayjs().unix(),
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

    case 'mars-stake':
      // If no coin movements (staking from wallet), set target to "Mars Staking"
      if (txCoinGroups.length === 0) {
        toast.target = 'Mars Staking'
        toast.message = toastOptions?.message || 'Staked MARS'
      } else {
        // Clear the message since we'll add it to content instead for combined transactions
        toast.message = undefined

        // Process any coin movements (like withdrawals) FIRST, in the correct order
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

        // Add the staking message as content AFTER the withdrawals
        const stakingText = toastOptions?.message || 'Staked MARS'
        toast.content.push({
          text: stakingText,
          coins: [],
        })
      }

      mutationKeys.push(`neutron-staked-mars/##ADDRESS##`, `neutron-unstaked-mars/##ADDRESS##`)
      break

    case 'mars-unstake':
      toast.target = 'Mars Staking'
      toast.message = toastOptions?.message || 'Unstaked MARS'
      mutationKeys.push(`neutron-staked-mars/##ADDRESS##`, `neutron-unstaked-mars/##ADDRESS##`)
      break

    case 'mars-withdraw':
      toast.target = 'Mars Staking'
      toast.message = toastOptions?.message || 'Withdrew MARS'
      mutationKeys.push(`neutron-staked-mars/##ADDRESS##`, `neutron-unstaked-mars/##ADDRESS##`)
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
  const lowerCaseError = error.toLocaleLowerCase()
  console.error(error)
  if (lowerCaseError.includes('too old'))
    return 'The oracle prices are stale. Please wait until the prices in the oracle contract are updated again.'

  if (
    lowerCaseError.includes('max ltv health factor') ||
    lowerCaseError.includes('actions did not result in improved health factor')
  )
    return 'You can not execute this transaction, since it would result in a Health Factor below 1.'

  if (lowerCaseError.includes('incorrect account sequence'))
    return 'You have a pending transaction. Wait for it to be executed and try again.'

  if (lowerCaseError.includes('oi reached'))
    return 'You can not execute this perp order, since it would exceed the maximum Open Interest for this market.'

  if (lowerCaseError.includes('insufficient funds'))
    return "You don't have enough funds to execute this transaction."

  if (lowerCaseError.includes('cannot sub'))
    return 'The received amount was less than the expected amount: subtraction would result in an invalid value.'

  if (lowerCaseError.includes('spendable balance'))
    return 'You can not execute this transaction. There is not enough spendable balance in the market or your wallet.'

  if (lowerCaseError === 'transaction failed: request rejected')
    return 'Transaction rejected by user.'

  if (lowerCaseError.includes('less or equal available liquidity'))
    return 'There is not enough available liquidity in the selected assets market to borrow.'

  if (lowerCaseError.includes('generic error'))
    return 'Transaction failed: Unknown error. Please try again.'

  if (lowerCaseError.includes('withdraw') && lowerCaseError.includes('is not enabled'))
    return 'The withdrawal of this asset is temporarily disabled.'

  return `Transaction failed: ${error}`
}
