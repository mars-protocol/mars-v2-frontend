import getAccount from 'api/accounts/getAccount'
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

export async function analizeTransaction(
  chainConfig: ChainConfig,
  result: BroadcastResult,
  address: string,
): Promise<{
  target: string
  transactionType: string
  recipient: TransactionRecipient
  txCoins: TransactionCoins
}> {
  let recipient: TransactionRecipient = 'wallet'
  let target = 'Red Bank'
  console.log(result)

  const accountId = getCreditAccountIdFromBroadcastResult(result)
  const account = accountId ? await getAccount(chainConfig, accountId) : undefined
  if (account) {
    target =
      account.kind === 'high_levered_strategy'
        ? `HLS Account ${account.id}`
        : `Account ${account.id}`
  }

  const txCoins = getTransactionCoins(result, address, target)

  let transactionType = getTransactionTypeFromCoins(txCoins)
  if (transactionType === 'execution') {
    transactionType = getTransactionTypeFromBroadcastResult(result)
  }

  return {
    target,
    transactionType,
    recipient,
    txCoins,
  }
}

function getCreditAccountIdFromBroadcastResult(result: BroadcastResult) {
  const existingAccountId = getSingleValueFromBroadcastResult(result.result, 'wasm', 'account_id')

  if (!existingAccountId) {
    const newAccountId = getSingleValueFromBroadcastResult(result.result, 'wasm', 'token_id')
    if (newAccountId) return newAccountId
  }

  return existingAccountId
}

function getTransactionTypes() {
  const transactionTypes = new Map<string, string>()

  // transactionTypes keys are the actions and the value is the transaction type
  transactionTypes.set('create_credit_account', 'create')
  transactionTypes.set('burn', 'burn')
  transactionTypes.set('update_price_feeds', 'oracle')

  return transactionTypes
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
  coinRules.set('open_position', 'perps')
  coinRules.set('close_position', 'perps')
  return coinRules
}

function getTransactionCoins(result: BroadcastResult, address: string, target: string) {
  const isHLS = target.split(' ')[0] === 'HLS'
  const transactionCoins: TransactionCoins = {
    borrow: [],
    deposit: [],
    lend: [],
    repay: [],
    reclaim: [],
    swap: [],
    withdraw: [],
    vault: [],
    perps: [],
    pnl: [],
  }
  const eventTypes = ['wasm', 'token_swapped', 'pool_joined']
  const perpsMethods = ['open_position', 'close_position']
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
    if (event.type === 'pool_joined') {
      const vaultTokens = getVaultTokensFromEvent(event)
      if (vaultTokens) transactionCoins.vault.push(...vaultTokens)
    }
    event.attributes.forEach((attr: TransactionEventAttribute) => {
      if (attr.key !== 'action' && attr.key !== 'method') return

      const coin = getCoinFromEvent(event)
      if (!coin) return

      const target = getTargetFromEvent(event, address)
      const action = attr.value
      const coinType = coinRules.get(`${action}_${target}`) ?? coinRules.get(action)
      if (coinType) transactionCoins[coinType].push(...coin)

      if (perpsMethods.includes(action)) {
        event.attributes.forEach((attr: TransactionEventAttribute) => {
          const realizedProfitOrLoss = attr.key === 'realised_pnl' ? attr.value : undefined
          if (realizedProfitOrLoss) {
            const pnlCoin = getCoinFromPnLString(realizedProfitOrLoss)
            if (pnlCoin) {
              transactionCoins.pnl.push(pnlCoin)
            }
          }
        })
      }

      if (isHLS) {
        const HLSDeposit = findUpdateCoinBalanceAndAddDeposit(event, transactionCoins)
        if (HLSDeposit) transactionCoins.deposit.push(HLSDeposit)
      }
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
  const size = event.attributes.find((a) => a.key === 'size')?.value
  const newSize = event.attributes.find((a) => a.key === 'new_size')?.value

  if (denom && amount) coins.push(BNCoin.fromDenomAndBigNumber(denom, BN(amount)).toCoin())
  if (denom && (size || newSize))
    coins.push(BNCoin.fromDenomAndBigNumber(denom, size ? BN(size) : BN(newSize ?? 0)).toCoin())

  event.attributes.forEach((attr: TransactionEventAttribute) => {
    const amountDenomString = denomAmountActions.includes(attr.key) ? attr.value : undefined
    if (amountDenomString) {
      const coin = getCoinFromAmountDenomString(amountDenomString)
      if (coin) coins.push(coin)
    }
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

function findUpdateCoinBalanceAndAddDeposit(
  event: TransactionEvent,
  transactionCoins: TransactionCoins,
) {
  if (event.attributes.find((a) => a.key === 'action')?.value !== 'update_coin_balance') return
  const amountDenomString = event.attributes.find((a) => a.key === 'coin')?.value
  if (!amountDenomString) return
  const result = getCoinFromAmountDenomString(amountDenomString)
  if (!result) return

  return transactionCoins.deposit.length ? mergeCoins(transactionCoins.deposit[0], result) : result
}

function getTargetFromEvent(event: TransactionEvent, address: string): TransactionRecipient {
  const recipient = event.attributes.find((a) => a.key === 'recipient')?.value

  if (recipient && recipient === address) return 'wallet'
  return 'contract'
}

function mergeCoins(coin1: Coin, coin2: Coin): Coin {
  if (coin1.denom !== coin2.denom) return coin2

  return BNCoin.fromDenomAndBigNumber(coin1.denom, BN(coin1.amount).plus(BN(coin2.amount))).toCoin()
}

function getTransactionTypeFromCoins(coins: TransactionCoins): string {
  if (
    coins.borrow.length > 0 ||
    coins.deposit.length > 0 ||
    coins.lend.length > 0 ||
    coins.repay.length > 0 ||
    coins.withdraw.length > 0 ||
    coins.reclaim.length > 0 ||
    coins.swap.length > 0 ||
    coins.perps.length > 0 ||
    coins.pnl.length > 0
  )
    return 'transaction'

  if (coins.perps) return 'perps'

  return 'execution'
}

function getTransactionTypeFromBroadcastResult(result: BroadcastResult): string {
  const transactionTypes = getTransactionTypes()
  const eventTypes = ['begin_unlock', 'wasm']
  let transactionType = 'execution'

  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (event.type === 'begin_unlock') return 'unlock'

    if (event.type === 'wasm') {
      const action = event.attributes.find((a) => a.key === 'action')?.value ?? ''
      const foundTransactionType = transactionTypes.get(action)
      if (foundTransactionType) transactionType = foundTransactionType
    }
  })

  return transactionType
}

function getVaultTokensFromEvent(event: TransactionEvent): Coin[] | undefined {
  const denomAndAmountStringArray = event.attributes
    .find((a) => a.key === 'tokens_in')
    ?.value.split(',')
  if (!denomAndAmountStringArray) return
  if (denomAndAmountStringArray.length !== 2) return
  const vaultToken1 = getCoinFromAmountDenomString(denomAndAmountStringArray[0])
  const vaultToken2 = getCoinFromAmountDenomString(denomAndAmountStringArray[1])
  if (!vaultToken1 || !vaultToken2) return
  return [vaultToken1, vaultToken2]
}

function getCoinFromAmountDenomString(amountDenomString: string): Coin | undefined {
  const regex = /(?:(\d+).*)/g
  const matches = regex.exec(amountDenomString)
  if (!matches || matches.length < 2) return
  const denom = amountDenomString.split(matches[1])[1]
  return BNCoin.fromDenomAndBigNumber(denom, BN(matches[1])).toCoin()
}

function getCoinFromPnLString(pnlString: string): Coin | undefined {
  const pnlStringParts = pnlString.split(':')
  if (pnlStringParts.length !== 3) return

  if (pnlStringParts[0] === 'profit')
    return BNCoin.fromDenomAndBigNumber(pnlStringParts[1], BN(pnlStringParts[2])).toCoin()
  if (pnlStringParts[0] === 'loss')
    return BNCoin.fromDenomAndBigNumber(pnlStringParts[1], BN(pnlStringParts[2]).negated()).toCoin()
  return
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
    vault: removeDuplicates(coins.vault),
    perps: coins.perps,
    pnl: removeDuplicates(coins.pnl),
  }

  return uniqueCoins
}

function removeDuplicates(coins: Coin[]): Coin[] {
  return coins.filter(
    (coin, index, self) =>
      self.findIndex((c) => c.denom === coin.denom && c.amount === coin.amount) === index,
  )
}
