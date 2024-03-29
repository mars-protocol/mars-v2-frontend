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
  coinRules.set('borrow', 'borrow')

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
  const eventTypes = ['wasm', 'token_swapped']
  const coinRules = getRules()
  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (!Array.isArray(event.attributes)) return
    if (event.type === 'token_swapped') {
      const { tokenIn, tokenOut } = getCoinFromSwapEvent(event)
      if (tokenIn && tokenOut) transactionCoins.swap.push(tokenIn, tokenOut)
      return
    }
    event.attributes.forEach((attr: TransactionEventAttribute) => {
      if (attr.key !== 'action') return

      const coin = getCoinFromEvent(event)
      if (!coin) return

      const target = getTargetFromEvent(event, address)
      const action = attr.value
      const coinType = coinRules.get(`${action}_${target}`) ?? coinRules.get(action)
      if (coinType) transactionCoins[coinType].push(...coin)
    })
  })

  return removeDuplicatesFromTransactionCoins(transactionCoins)
}

function getCoinFromEvent(event: TransactionEvent) {
  const coins = [] as Coin[]
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

  if (denom && amount) coins.push(BNCoin.fromDenomAndBigNumber(denom, BN(amount)).toCoin())

  event.attributes.forEach((attr: TransactionEventAttribute) => {
    const amountDenomString = denomAmountActions.includes(attr.key) ? attr.value : undefined
    if (!amountDenomString) return
    const result = getCoinFromAmountDenomString(amountDenomString)
    if (result) coins.push(result)
  })
  return coins
}

function getCoinFromSwapEvent(event: TransactionEvent) {
  const tokenInAmountDenomString = event.attributes.find((a) => a.key === 'tokens_in')?.value
  const tokenOutAmountDenomString = event.attributes.find((a) => a.key === 'tokens_out')?.value

  if (!tokenInAmountDenomString || !tokenOutAmountDenomString)
    return { tokenIn: undefined, tokenOut: undefined }

  return {
    tokenIn: getCoinFromAmountDenomString(tokenInAmountDenomString),
    tokenOut: getCoinFromAmountDenomString(tokenOutAmountDenomString),
  }
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

function getCoinFromAmountDenomString(amountDenomString: string): Coin | undefined {
  const regex = /(?:(\d+).*)/g
  const matches = regex.exec(amountDenomString)
  if (!matches || matches.length < 2) return
  const denom = amountDenomString.split(matches[1])[1]
  return BNCoin.fromDenomAndBigNumber(denom, BN(matches[1])).toCoin()
}

function removeDuplicatesFromTransactionCoins(coins: TransactionCoins): TransactionCoins {
  const uniqueCoins = {
    borrow: removeDuplicates(coins.borrow),
    deposit: removeDuplicates(coins.deposit),
    lend: removeDuplicates(coins.lend),
    repay: removeDuplicates(coins.repay),
    reclaim: removeDuplicates(coins.reclaim),
    swap: removeDuplicates(coins.swap),
    withdraw: removeDuplicates(coins.withdraw),
  }

  return uniqueCoins
}

function removeDuplicates(coins: Coin[]): Coin[] {
  return coins.filter(
    (coin, index, self) =>
      self.findIndex((c) => c.denom === coin.denom && c.amount === coin.amount) === index,
  )
}
