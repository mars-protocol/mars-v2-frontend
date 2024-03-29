import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function getSingleValueFromBroadcastResult(
  response: BroadcastResult['result'],
  eventType: string,
  eventKey: string,
): string | null {
  const value = response?.response.events
    .filter((event: TransactionEvent) => event.type === eventType)
    .map((event: TransactionEvent) => event.attributes)
    .flat()
    .find((event: TransactionEventAttribute) => event.key === eventKey)?.value

  if (!value) return null
  return value
}

export function generateErrorMessage(result: BroadcastResult, errorMessage?: string) {
  const error = result.error ? result.error : result.result?.rawLogs
  if (errorMessage) return errorMessage
  if (error === 'Transaction failed: Request rejected') return 'Transaction rejected by user'
  return `Transaction failed: ${error}`
}

export function analizeTransaction(
  result: BroadcastResult,
  chainConfig: ChainConfig,
  address: string,
): {
  target: string
  transactionType: string
  recipient: TransactionRecipient
  txCoins: TransactionCoins
} {
  let target = 'Red Bank'
  let recipient: TransactionRecipient = 'wallet'

  console.log(result)
  const filteredEvents = result?.result?.response.events
    .filter(
      (event: TransactionEvent) =>
        event.type === 'wasm' || event.type === 'coin_spent' || event.type === 'coin_received',
    )
    .flat()
  console.log('filtered', filteredEvents)

  const accountId = getSingleValueFromBroadcastResult(result.result, 'wasm', 'account_id')
  if (accountId) target = `Credit Account ${accountId}`

  const txCoins = getTransactionCoins(result, address)

  const transactionType = getTransactionTypeFromCoins(txCoins)

  return {
    target,
    transactionType,
    recipient,
    txCoins,
  }
}

function getTransactionCoins(result: BroadcastResult, address: string) {
  let transactionCoins: TransactionCoins = {
    borrow: [],
    deposit: [],
    lend: [],
    repay: [],
    reclaim: [],
    swap: [],
    withdraw: [],
  }

  const filteredEvents = result?.result?.response.events
    .filter(
      (event: TransactionEvent) =>
        event.type === 'wasm' || event.type === 'coin_spent' || event.type === 'coin_received',
    )
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (event.type === 'wasm') {
      if (!Array.isArray(event.attributes)) return
      event.attributes.forEach((attr: TransactionEventAttribute) => {
        if (attr.key !== 'action') return
        const coin = getCoinFromEvent(event)
        const target = getTargetFromEvent(event, address)
        if (attr.value === 'withdraw' && coin) transactionCoins.withdraw.push(coin)
        if (attr.value === 'withdraw' && target !== 'wallet' && coin)
          transactionCoins.reclaim.push(coin)
        if (attr.value === 'deposit' && coin) transactionCoins.deposit.push(coin)
      })
    }
  })

  return transactionCoins
}

function getCoinFromEvent(event: TransactionEvent) {
  const denom = event.attributes.find((a) => a.key === 'denom')?.value
  const amount = event.attributes.find((a) => a.key === 'amount')?.value
  if (!denom || !amount) return
  return BNCoin.fromDenomAndBigNumber(denom, BN(amount))
}

function getTargetFromEvent(event: TransactionEvent, address: string): TransactionRecipient {
  const recipient = event.attributes.find((a) => a.key === 'recipient')?.value

  if (recipient && recipient === address) return 'wallet'
  return 'contract'
}

function getTransactionTypeFromCoins(coins: TransactionCoins): string {
  if (coins.borrow.length > 0) return 'borrow'
  if (coins.deposit.length > 0) return 'deposit'
  if (coins.lend.length > 0) return 'lend'
  if (coins.repay.length > 0) return 'repay'
  if (coins.withdraw.length > 0 || coins.reclaim.length > 0) return 'withdraw'
  return 'create'
}

export function getTokenOutFromSwapResponse(response: BroadcastResult, denom: string): Coin {
  try {
    if (response.result?.response.code === 0) {
      const rawLogs = JSON.parse(response.result.rawLogs)
      const events = rawLogs.map((log: any) => log.events).flat() as Event[]
      let tokensOutValue = '0'
      events.forEach((event: Event) => {
        const attributes = event.attributes
        const type = event.type
        if (type === 'token_swapped') {
          attributes.forEach((a) => {
            if (a.key === 'tokens_out' && a.value.toLowerCase().includes(denom.toLowerCase())) {
              tokensOutValue = a.value
            }
          })
        }
      })

      const amount = tokensOutValue.split(denom)[0]
      return { denom, amount }
    }
  } catch (ex) {
    console.error(ex)
  }

  return { denom, amount: '0' }
}
