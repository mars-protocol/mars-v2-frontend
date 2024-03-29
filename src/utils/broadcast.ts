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
  /* TODO: beautify error messages */
  return `Transaction failed: ${error}`
}

export function analizeTransaction(
  result: BroadcastResult,
  address: string,
): {
  target: string
  transactionType: string
  recipient: TransactionRecipient
  txCoins: TransactionCoins
} {
  let recipient: TransactionRecipient = 'wallet'
  console.log(result)

  const accountId = getSingleValueFromBroadcastResult(result.result, 'wasm', 'account_id')
  const target = accountId ? `Credit Account ${accountId}` : 'Red Bank'

  const txCoins = getTransactionCoins(result, address)

  const transactionType = getTransactionTypeFromCoins(txCoins)

  return {
    target,
    transactionType,
    recipient,
    txCoins,
  }
}

function getRules() {
  const coinRules = new Map<string, TransactionCoinType>()

  // coinRule keys are either ${action} or `${action}_${target}`
  coinRules.set('withdraw_wallet', 'withdraw')
  coinRules.set('callback/withdraw', 'withdraw')
  coinRules.set('reclaim', 'reclaim')
  coinRules.set('callback/deposit', 'deposit')
  coinRules.set('repay_from_wallet', 'deposit')
  coinRules.set('deposit_wallet', 'deposit')
  coinRules.set('deposit_contract', 'lend')
  coinRules.set('repay', 'repay')

  return coinRules
}

function getTransactionCoins(result: BroadcastResult, address: string) {
  const transactionCoins: TransactionCoins = {
    borrow: [],
    deposit: [],
    lend: [],
    repay: [],
    reclaim: [],
    swap: [],
    withdraw: [],
  }
  const coinRules = getRules()
  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => event.type === 'wasm')
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (!Array.isArray(event.attributes)) return
    event.attributes.forEach((attr: TransactionEventAttribute) => {
      if (attr.key !== 'action') return

      const coin = getCoinFromEvent(event)
      if (!coin) return

      const target = getTargetFromEvent(event, address)
      const action = attr.value
      const coinType = coinRules.get(`${action}_${target}`) ?? coinRules.get(action)
      if (coinType) transactionCoins[coinType].push(coin)
    })
  })

  return transactionCoins
}

function getCoinFromEvent(event: TransactionEvent) {
  const denomAmountActions = [
    'coin_reclaimed',
    'coin_deposited',
    'coin_withdrawn',
    'coin_repaid',
    'borrow',
    'repay',
  ]

  const denom = event.attributes.find((a) => a.key === 'denom')?.value
  const amount = event.attributes.find((a) => a.key === 'amount')?.value

  if (!denom || !amount) {
    const amountDenomString = event.attributes.find((a) =>
      denomAmountActions.includes(a.key),
    )?.value

    if (!amountDenomString) return
    return getBNCoinFromAmountDenomString(amountDenomString)
  }

  return BNCoin.fromDenomAndBigNumber(denom, BN(amount))
}

function getTargetFromEvent(event: TransactionEvent, address: string): TransactionRecipient {
  const recipient = event.attributes.find((a) => a.key === 'recipient')?.value

  if (recipient && recipient === address) return 'wallet'
  return 'contract'
}

function getTransactionTypeFromCoins(coins: TransactionCoins): string {
  if (
    coins.borrow.length > 0 ||
    coins.deposit.length > 0 ||
    coins.lend.length > 0 ||
    coins.repay.length > 0 ||
    coins.withdraw.length > 0 ||
    coins.reclaim.length > 0 ||
    coins.swap.length > 0
  )
    return 'transaction'
  return 'create'
}

export function getBNCoinFromAmountDenomString(amountDenomString: string): BNCoin | undefined {
  const regex = /(?:(\d+).*)/g
  const matches = regex.exec(amountDenomString)
  if (!matches || matches.length < 2) return
  const denom = amountDenomString.split(matches[1])[1]
  return BNCoin.fromDenomAndBigNumber(denom, BN(matches[1]))
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
