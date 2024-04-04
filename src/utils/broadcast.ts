import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { getAssetSymbol } from './assets'
import { getVaultByDenoms } from './vaults'

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
  isHLS: boolean
  transactionType: TransactionType
  txCoinGroups: GroupedTransactionCoin[]
}> {
  let target = 'Red Bank'
  let accountKind = 'default'
  const accountId = getCreditAccountIdFromBroadcastResult(result)
  if (accountId) {
    const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)
    accountKind = await creditManagerQueryClient.accountKind({ accountId: accountId })
    if (accountKind) {
      target =
        accountKind === 'high_levered_strategy'
          ? `HLS Account ${accountId}`
          : `Account ${accountId}`
    }
  }
  const isHLS = accountKind === 'high_levered_strategy'

  const txCoinGroups = getTransactionCoins(result, address, isHLS)

  const transactionType = txCoinGroups.length
    ? 'transaction'
    : getTransactionTypeFromBroadcastResult(result)

  return {
    target,
    isHLS,
    transactionType,
    txCoinGroups,
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

function getTransactionTypesByAction() {
  const transactionTypes = new Map<string, TransactionType>()

  // transactionTypes keys are the actions and the value is the transaction type
  transactionTypes.set('create_credit_account', 'create')
  transactionTypes.set('burn', 'burn')
  transactionTypes.set('update_price_feeds', 'oracle')
  transactionTypes.set('unlock', 'unlock')

  return transactionTypes
}

function getRules() {
  const coinRules = new Map<string, TransactionCoinType>()

  // coinRule keys are either ${action} or `${action}_${target}`
  coinRules.set('withdraw_wallet', 'withdraw')
  coinRules.set('callback/withdraw', 'withdraw')
  coinRules.set('reclaim', 'reclaim')
  coinRules.set('callback/deposit', 'deposit')
  coinRules.set('repay_from_wallet', 'deposit_from_wallet')
  coinRules.set('deposit_wallet', 'deposit_from_wallet')
  coinRules.set('deposit_contract', 'lend')
  coinRules.set('deposit_to_perp_vault', 'vault')
  coinRules.set('repay', 'repay')
  coinRules.set('borrow', 'borrow')
  coinRules.set('open_position', 'perps')
  coinRules.set('close_position', 'perps')
  coinRules.set('modify_position', 'perps')
  return coinRules
}

function getTransactionCoins(result: BroadcastResult, address: string, isHLS: boolean) {
  const transactionCoins: TransactionCoin[] = []
  const eventTypes = ['wasm', 'token_swapped', 'pool_joined']
  const perpsMethods = ['open_position', 'close_position', 'modify_position']
  const transactionAttributes = ['action', 'method']
  const coinRules = getRules()
  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (!Array.isArray(event.attributes)) return
    if (event.type === 'token_swapped') {
      const { tokenIn, tokenOut } = getCoinFromSwapEvent(event)
      if (tokenIn && tokenOut) {
        transactionCoins.push({ type: 'swap', coin: tokenIn })
        transactionCoins.push({ type: 'swap', coin: tokenOut })
      }
      return
    }
    if (event.type === 'pool_joined') {
      const vaultTokens = getVaultTokensFromEvent(event)
      if (vaultTokens)
        vaultTokens.map((coin) => transactionCoins.push({ type: 'vault', coin: coin }))
    }
    event.attributes.forEach((attr: TransactionEventAttribute) => {
      if (!transactionAttributes.includes(attr.key)) return

      const coins = getCoinsFromEvent(event)
      if (!coins) return

      const target = getTargetFromEvent(event, address)
      const action = attr.value
      const coinType = coinRules.get(`${action}_${target}`) ?? coinRules.get(action)
      if (coinType)
        coins.map((eventCoin) =>
          transactionCoins.push({ type: coinType, coin: eventCoin.coin, before: eventCoin.before }),
        )

      if (perpsMethods.includes(action)) {
        event.attributes.forEach((attr: TransactionEventAttribute) => {
          const realizedProfitOrLoss = attr.key === 'realised_pnl' ? attr.value : undefined
          if (realizedProfitOrLoss) {
            const pnlCoin = getCoinFromPnLString(realizedProfitOrLoss)
            if (pnlCoin) transactionCoins.push({ type: 'perpsPnl', coin: pnlCoin })
          }
        })
      }

      if (isHLS) {
        const HLSDeposit = findUpdateCoinBalanceAndAddDeposit(event, transactionCoins)
        if (HLSDeposit) transactionCoins.push({ type: 'deposit', coin: HLSDeposit })
      }
    })
  })

  return groupTransactionCoins(transactionCoins)
}

function getCoinsFromEvent(event: TransactionEvent) {
  const coins = [] as { coin: BNCoin; before?: BNCoin }[]
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
  const startingSize = event.attributes.find((a) => a.key === 'starting_size')?.value

  if (denom && amount) coins.push({ coin: BNCoin.fromDenomAndBigNumber(denom, BN(amount)) })
  if (denom && size && !newSize && !startingSize)
    coins.push({
      coin: BNCoin.fromDenomAndBigNumber(denom, BN(size)),
      before: BNCoin.fromDenomAndBigNumber(denom, BN_ZERO),
    })

  if (denom && newSize && startingSize)
    coins.push({
      coin: BNCoin.fromDenomAndBigNumber(denom, BN(startingSize)),
      before: BNCoin.fromDenomAndBigNumber(denom, BN(newSize)),
    })

  event.attributes.forEach((attr: TransactionEventAttribute) => {
    const amountDenomString = denomAmountActions.includes(attr.key) ? attr.value : undefined
    if (amountDenomString) {
      const coin = getCoinFromAmountDenomString(amountDenomString)
      if (coin) coins.push({ coin: coin })
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
  transactionCoins: TransactionCoin[],
) {
  if (event.attributes.find((a) => a.key === 'action')?.value !== 'update_coin_balance') return
  const amountDenomString = event.attributes.find((a) => a.key === 'coin')?.value
  if (!amountDenomString) return
  const result = getCoinFromAmountDenomString(amountDenomString)
  if (!result) return

  const depositFromWallet = transactionCoins.find((c) => c.type === 'deposit_from_wallet')?.coin
  return depositFromWallet ? mergeCoinAmounts(depositFromWallet, result) : result
}

function getTargetFromEvent(event: TransactionEvent, address: string): TransactionRecipient {
  const recipient = event.attributes.find((a) => a.key === 'recipient')?.value

  if (recipient && recipient === address) return 'wallet'
  return 'contract'
}

function mergeCoinAmounts(coin1: BNCoin, coin2: BNCoin): BNCoin {
  if (coin1.denom !== coin2.denom) return coin2

  return BNCoin.fromDenomAndBigNumber(coin1.denom, coin1.amount.plus(coin2.amount))
}

function getTransactionTypeFromBroadcastResult(result: BroadcastResult): TransactionType {
  const transactionTypes = getTransactionTypesByAction()
  const eventTypes = ['begin_unlock', 'wasm']
  const transactionAttributes = ['action', 'method']
  let transactionType = 'default' as TransactionType

  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (event.type === 'begin_unlock') return 'unlock'

    if (event.type === 'wasm') {
      const action =
        event.attributes.find((a) => transactionAttributes.includes(a.key))?.value ?? ''
      const foundTransactionType = transactionTypes.get(action)
      if (foundTransactionType) transactionType = foundTransactionType
    }
  })

  return transactionType
}

function getVaultTokensFromEvent(event: TransactionEvent): BNCoin[] | undefined {
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

function getCoinFromAmountDenomString(amountDenomString: string): BNCoin | undefined {
  const regex = /(?:(\d+).*)/g
  const matches = regex.exec(amountDenomString)
  if (!matches || matches.length < 2) return
  const denom = amountDenomString.split(matches[1])[1]
  return BNCoin.fromDenomAndBigNumber(denom, BN(matches[1]))
}

function getCoinFromPnLString(pnlString: string): BNCoin | undefined {
  const pnlStringParts = pnlString.split(':')
  if (pnlStringParts.length !== 3) return

  if (pnlStringParts[0] === 'profit')
    return BNCoin.fromDenomAndBigNumber(pnlStringParts[1], BN(pnlStringParts[2]))
  if (pnlStringParts[0] === 'loss')
    return BNCoin.fromDenomAndBigNumber(pnlStringParts[1], BN(pnlStringParts[2]).negated())
  return
}

function groupTransactionCoins(coins: TransactionCoin[]): GroupedTransactionCoin[] {
  const groupedCoins = [] as GroupedTransactionCoin[]

  coins.forEach((txCoin) => {
    const existingCoin = groupedCoins.find(
      (c) =>
        c.type === txCoin.type &&
        c.coins.find(
          (coin) =>
            coin.coin.denom === txCoin.coin.denom && coin.coin.amount.isEqualTo(txCoin.coin.amount),
        ),
    )
    if (existingCoin) return

    const existingType = groupedCoins.find((c) => c.type === txCoin.type)
    if (existingType) {
      existingType.coins.push(txCoin)
      return
    }

    groupedCoins.push({ type: txCoin.type, coins: [txCoin] })
  })

  return groupedCoins
}

export function getToastContentsFromGroupedTransactionCoin(
  transactionCoin: GroupedTransactionCoin,
  isHLS: boolean,
  target: string,
  chainConfig: ChainConfig,
): ToastContent[] {
  const toastContents = [] as ToastContent[]
  const coins = transactionCoin.coins.map((c) => c.coin.toCoin())

  switch (transactionCoin.type) {
    case 'borrow':
      toastContents.push({
        text: 'Borrowed',
        coins,
      })
      break
    case 'deposit':
      toastContents.push({
        text: isHLS ? 'Deposited into HLS account' : 'Deposited',
        coins,
      })
      break
    case 'deposit_from_wallet':
      toastContents.push({
        text: 'Deposited from wallet',
        coins,
      })
      break
    case 'lend':
      toastContents.push({
        text: target === 'Red Bank' ? 'Deposited' : 'Lent',
        coins,
      })
      break
    case 'reclaim':
      toastContents.push({
        text: 'Unlent',
        coins,
      })
      break
    case 'repay':
      toastContents.push({
        text: 'Repaid',
        coins,
      })
      break
    case 'swap':
      toastContents.push({
        text: 'Swapped',
        coins,
      })
      break
    case 'withdraw':
      toastContents.push({
        text: 'Withdrew to wallet',
        coins,
      })
      break
    case 'vault':
      const vaultCoins = transactionCoin.coins.map((c) => c.coin.toCoin())
      toastContents.push({
        text:
          transactionCoin.coins.length === 2
            ? `Deposited into the ${getVaultByDenoms(chainConfig, vaultCoins)} vault`
            : `Deposited into the Perps ${getAssetSymbol(chainConfig, vaultCoins[0].denom)} vault`,
        coins: vaultCoins,
      })
      break
    case 'perps':
      transactionCoin.coins.forEach((txCoin) => {
        if (txCoin.before) {
          const perpsAssetSymbol = getAssetSymbol(chainConfig, txCoin.coin.denom)
          // if amount of the before positon was 0 -> opened a new position
          if (txCoin.before.amount.isZero()) {
            toastContents.push({
              text: txCoin.coin.amount.isPositive()
                ? `Opened ${perpsAssetSymbol} long`
                : `Opened ${perpsAssetSymbol} short`,
              coins: [txCoin.coin.abs().toCoin()],
            })
            return
          }
          // if amount of the new position is 0 -> close position
          if (txCoin.coin.amount.isZero()) {
            toastContents.push({
              text: txCoin.before.amount.isPositive()
                ? `Closed ${perpsAssetSymbol} long`
                : `Closed ${perpsAssetSymbol} short`,
              coins: [],
            })
          }
          // if amount of the new position is different from the before position -> modified position
          const beforeTradeDirection: TradeDirection = txCoin.before.amount.isPositive()
            ? 'long'
            : 'short'
          const afterTradeDirection: TradeDirection = txCoin.coin.amount.isPositive()
            ? 'long'
            : 'short'

          // if trade direction changed
          if (beforeTradeDirection !== afterTradeDirection) {
            toastContents.push({
              text: `Switched ${perpsAssetSymbol} from ${beforeTradeDirection} to ${afterTradeDirection}`,
              coins: [txCoin.coin.abs().toCoin()],
            })
            return
          }

          const modificationAnmount = txCoin.before.amount.abs().minus(txCoin.coin.amount.abs())
          const modificationCoin = BNCoin.fromDenomAndBigNumber(
            txCoin.coin.denom,
            modificationAnmount,
          )

          toastContents.push({
            text: modificationAnmount.isPositive()
              ? `Increased ${perpsAssetSymbol} ${afterTradeDirection} by`
              : `Decreased ${perpsAssetSymbol} ${afterTradeDirection} by`,
            coins: [modificationCoin.toCoin()],
          })
          return
        }
      })

      break
    case 'perpsPnl':
      const perpsPnlCoins = transactionCoin.coins.map((c) => c.coin)
      perpsPnlCoins.forEach((coin) => {
        if (BN(coin.amount).isPositive()) {
          toastContents.push({
            text: 'Realised profit',
            coins: [coin.toCoin()],
          })
        }
        if (BN(coin.amount).isNegative()) {
          toastContents.push({
            text: 'Realised loss',
            coins: [coin.abs().toCoin()],
          })
        }
      })
      break
  }

  return toastContents
}

export function sortFunds(funds: Coin[]) {
  // FIX:
  // Transaction failed: Broadcasting transaction failed with code 10 (codespace: sdk). Log: sentFunds: invalid coins
  // Transaction on Osmosis fail, if uosmo is not at the last position of the funds array
  return funds.sort((a, b) => a.denom.localeCompare(b.denom))
}
