import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { removeEmptyCoins } from 'utils/accounts'
import { getAssetSymbolByDenom } from 'utils/assets'
import { beautifyErrorMessage } from 'utils/generateToast'
import { BN } from 'utils/helpers'
import { getVaultNameByCoins } from 'utils/vaults'

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
  return beautifyErrorMessage(error ?? 'Transaction Simulation failed.')
}

export async function analizeTransaction(
  chainConfig: ChainConfig,
  result: BroadcastResult,
  address: string,
  perpsBaseDenom?: string,
): Promise<{
  target: string
  isHls: boolean
  transactionType: TransactionType
  txCoinGroups: GroupedTransactionCoin[]
}> {
  // Set default values for target (Red Bank or Credit Account) and accountKind (default or high_levered_strategy)
  let target = 'Red Bank'
  let accountKind = 'default'

  // Check for the usage of a credit account in the BroadcastResult
  const accountId = getCreditAccountIdFromBroadcastResult(result)

  if (accountId) {
    // If it is a credit account, get the AccountKind of the credit account
    const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)
    accountKind = (await creditManagerQueryClient.accountKind({ accountId: accountId })) as any
    if (accountKind) {
      target =
        accountKind === 'high_levered_strategy'
          ? `Hls Account ${accountId}`
          : `Account ${accountId}`
    }
  }
  const isHls = accountKind === 'high_levered_strategy'

  // Fetch all coins from the BroadcastResult
  const txCoinGroups = getTransactionCoinsGrouped(result, address, isHls, perpsBaseDenom)

  // If there are no coins involved, try to identify the transaction type, otherwise set it to 'transaction'
  const transactionType = txCoinGroups.length
    ? 'transaction'
    : getTransactionTypeFromBroadcastResult(result)

  return {
    target,
    isHls,
    transactionType,
    txCoinGroups,
  }
}

export function getCreditAccountIdFromBroadcastResult(result: BroadcastResult) {
  // Check for interaction with an existing credit account
  const existingAccountId = getSingleValueFromBroadcastResult(result.result, 'wasm', 'account_id')

  // Check for the token_id attribute of the mint action
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
  transactionTypes.set('withdraw_from_perp_vault', 'withdraw_from_vault')
  transactionTypes.set('create_trigger_order', 'create-order')
  transactionTypes.set('cancel_trigger_order', 'cancel-order')

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
  coinRules.set('deposit_to_perp_vault', 'deposit_into_vault')
  coinRules.set('repay', 'repay')
  coinRules.set('borrow', 'borrow')
  coinRules.set('open_perp_position', 'perps')
  coinRules.set('execute_perp_order', 'perps')
  coinRules.set('withdraw_liquidity', 'farm')
  coinRules.set('provide_liquidity', 'provide_liquidity')
  coinRules.set('claim_rewards', 'claim_rewards')
  coinRules.set('create_trigger_order', 'create-order')
  coinRules.set('cancel_trigger_order', 'cancel-order')
  coinRules.set('swap', 'swap')

  return coinRules
}

function getTransactionCoinsGrouped(
  result: BroadcastResult,
  address: string,
  isHls: boolean,
  perpsBaseDenom?: string,
) {
  const transactionCoins: TransactionCoin[] = []
  // Event types that include coins are wasm, token_swapped and pool_joined
  // This should be streamlined by SC one day
  const eventTypes = ['wasm', 'token_swapped', 'pool_joined']

  const coinRules = getRules()

  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    if (!Array.isArray(event.attributes)) return
    // Check if the event type is a token_swapped and get coins from the event
    // This is needed for the "old" swap event, while the new swap event has an action attribute
    if (event.type === 'token_swapped') {
      const { tokenIn, tokenOut } = getCoinFromSwapEvent(event)
      if (tokenIn && tokenOut) {
        transactionCoins.push({ type: 'swap', coin: tokenIn })
        transactionCoins.push({ type: 'swap', coin: tokenOut })
      }
      return
    }

    // Check if the event type is a pool_join event and get coins from the event
    if (event.type === 'pool_joined') {
      const vaultTokens = getVaultTokensFromEvent(event)
      if (vaultTokens)
        vaultTokens.map((coin) => transactionCoins.push({ type: 'deposit_into_vault', coin: coin }))

      // There is no return here, since the pool_joined event can also include coins in the attributes
    }

    // Check all other events for coins
    event.attributes.forEach((attr: TransactionEventAttribute) => {
      if (attr.key !== 'action') return

      const coins = getCoinsFromEvent(event)
      if (!coins) return

      // Check if the TransactionRecipient is the wallet or a contract
      const target = getTargetFromEvent(event, address)
      const action = attr.value

      // Find the CoinType for the action and target

      let coinType = coinRules.get(`${action}_${target}`) ?? coinRules.get(action)

      if (isHls && action === 'callback/deposit')
        coinType = 'deposit_from_wallet' as TransactionCoinType
      coins.forEach((eventCoin) => {
        // check for duplicates
        const existingCoin = transactionCoins.find(
          (c) =>
            c.type === coinType &&
            c.type !== 'swap' &&
            c.coin.denom === eventCoin.coin.denom &&
            c.coin.amount.isEqualTo(eventCoin.coin.amount),
        )
        if (existingCoin) return

        if (!coinType) return
        transactionCoins.push({ type: coinType, coin: eventCoin.coin, before: eventCoin.before })
      })

      // If the event is a perps event, check for realized profit or loss
      if (coinRules.get(action) === 'perps' && perpsBaseDenom) {
        event.attributes.forEach((attr: TransactionEventAttribute) => {
          const realizedProfitOrLoss = attr.key === 'realized_pnl' ? attr.value : undefined
          if (realizedProfitOrLoss) {
            transactionCoins.push({
              type: 'perpsPnl',
              coin: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN(realizedProfitOrLoss)),
            })
          }
          const openingFee = attr.key === 'opening_fee' ? attr.value : undefined
          if (openingFee) {
            const openingFeeCoin = getCoinFromAmountDenomString(openingFee.trim())
            if (openingFeeCoin)
              transactionCoins.push({ type: 'perpsOpeningFee', coin: openingFeeCoin })
          }

          const closingFee = attr.key === 'closing_fee' ? attr.value : undefined
          if (closingFee) {
            const closingFeeCoin = getCoinFromAmountDenomString(closingFee.trim())
            if (closingFeeCoin)
              transactionCoins.push({ type: 'perpsClosingFee', coin: closingFeeCoin })
          }
        })
      }
      const zeroCoin = BNCoin.fromDenomAndBigNumber('uusd', BN_ZERO)
      if (coinRules.get(action) === 'create-order')
        transactionCoins.push({ type: 'create-order', coin: zeroCoin })
      if (coinRules.get(action) === 'cancel-order')
        transactionCoins.push({ type: 'cancel-order', coin: zeroCoin })

      if (isHls) {
        // If the account is an hls account, check for a deposit_from_wallet event and add the amount of the 'update_coin_balance' event
        // This is because the deposit from wallet is sent to the hls account first and then the result of a potential swap event
        // gets added to the hls account via 'update_coin_balance'.
        // To display those transaction correctly a 'deposit' coin has to be added to transactionCoins that has the sum of the deposit and the swap amount
        const HlsDeposit = findUpdateCoinBalanceAndAddDeposit(event, transactionCoins)
        if (HlsDeposit) {
          transactionCoins.push({ type: 'deposit', coin: HlsDeposit })
        }
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
    'provide_liquidity',
    'claimed_reward',
  ]

  // Check for denom and amount and add the coin to the return
  const denom = event.attributes.find((a) => a.key === 'denom')?.value
  const amount = event.attributes.find((a) => a.key === 'amount')?.value
  if (denom && amount) coins.push({ coin: BNCoin.fromDenomAndBigNumber(denom, BN(amount)) })

  // For perps actions check for size and new_size or entry_size
  const size = event.attributes.find((a) => a.key === 'order_size')?.value
  const newSize = event.attributes.find((a) => a.key === 'new_size')?.value

  // If there the size equals the newSize, set the before coin amount to 0 to indicate a new position
  if (denom && newSize && !size)
    coins.push({
      coin: BNCoin.fromDenomAndBigNumber(denom, BN(newSize)),
      before: BNCoin.fromDenomAndBigNumber(denom, BN_ZERO),
    })

  // If there is a size and a newSize or a startingSize, set the before coin accordingly to indicate a modification of a position
  if (denom && newSize && size)
    coins.push({
      coin: BNCoin.fromDenomAndBigNumber(denom, BN(newSize)),
      before: BNCoin.fromDenomAndBigNumber(denom, BN(newSize).minus(BN(size))),
    })

  // Check for denomAmount strings like '1000uosmo' and add the coin to the return
  event.attributes.forEach((attr: TransactionEventAttribute) => {
    const amountDenomString = denomAmountActions.includes(attr.key) ? attr.value : undefined
    if (amountDenomString) {
      const coin = getCoinFromAmountDenomString(amountDenomString.trim())
      if (coin) coins.push({ coin: coin })
    }
  })

  // Check for 'withdraw_liquidity' event and add the coins to the return
  const isWithdrawLiquidity =
    event.attributes.find((a) => a.key === 'action')?.value === 'withdraw_liquidity'
  if (isWithdrawLiquidity) {
    const withdrawTokens = getVaultTokensFromEvent(event)
    if (withdrawTokens) withdrawTokens.map((coin) => coins.push({ coin: coin }))
  }

  // Check for 'provide_liquidity' event and add the coins to the return
  const isProvideLiquidity =
    event.attributes.find((a) => a.key === 'action')?.value === 'provide_liquidity'
  if (isProvideLiquidity) {
    const depositTokens = getVaultTokensFromEvent(event)
    if (depositTokens) depositTokens.map((coin) => coins.push({ coin: coin }))
  }

  // Check if the event is a swap event and then return the coins
  const isSwap = event.attributes.find((a) => a.key === 'action')?.value === 'swap'
  if (isSwap) {
    const coinInDenom = event.attributes.find((a) => a.key === 'offer_asset')?.value
    const coinInAmount = event.attributes.find((a) => a.key === 'offer_amount')?.value
    const coinOutDenom = event.attributes.find((a) => a.key === 'ask_asset')?.value
    const coinOutAmount = event.attributes.find((a) => a.key === 'return_amount')?.value
    if (coinInDenom && coinInAmount && coinOutDenom && coinOutAmount) {
      coins.push(
        {
          coin: BNCoin.fromDenomAndBigNumber(coinInDenom, BN(coinInAmount)),
        },
        {
          coin: BNCoin.fromDenomAndBigNumber(coinOutDenom, BN(coinOutAmount)),
        },
      )
    }
  }

  return coins
}

function getCoinFromSwapEvent(event: TransactionEvent) {
  const tokenInAmountDenomString = event.attributes.find((a) => a.key === 'tokens_in')?.value
  const tokenOutAmountDenomString = event.attributes.find((a) => a.key === 'tokens_out')?.value

  if (!tokenInAmountDenomString || !tokenOutAmountDenomString)
    return { tokenIn: undefined, tokenOut: undefined }

  return {
    tokenIn: getCoinFromAmountDenomString(tokenInAmountDenomString.trim()),
    tokenOut: getCoinFromAmountDenomString(tokenOutAmountDenomString.trim()),
  }
}

function findUpdateCoinBalanceAndAddDeposit(
  event: TransactionEvent,
  transactionCoins: TransactionCoin[],
) {
  if (event.attributes.find((a) => a.key === 'action')?.value !== 'update_coin_balance') return
  const amountDenomString = event.attributes.find((a) => a.key === 'coin')?.value
  if (!amountDenomString) return
  const result = getCoinFromAmountDenomString(amountDenomString.trim())
  if (!result) return

  const depositFromWallet = transactionCoins.find(
    (c) => c.type === 'deposit_from_wallet' && c.coin.denom === result.denom,
  )?.coin
  if (!depositFromWallet) return result

  // If a deposit from wallet was found add the update_coin_balance to it
  // This is needed for Hls accounts, where the deposit_from_wallet and the update_coin_balance combined make up the final hls account deposit
  return result.plus(depositFromWallet.amount)
}

function getTargetFromEvent(event: TransactionEvent, address: string): TransactionRecipient {
  const recipient = event.attributes.find((a) => a.key === 'recipient')?.value

  if (recipient && recipient === address) return 'wallet'
  return 'contract'
}

function getTransactionTypeFromBroadcastResult(result: BroadcastResult): TransactionType {
  // BoradCastResult's that don't include any coins need to be checked for other actions and methods to identify the transaction type
  const transactionTypes = getTransactionTypesByAction()
  // Filter events by 'wasm' and the pseudo event 'begin_unlock'
  const eventTypes = ['begin_unlock', 'wasm']
  let transactionType = 'default' as TransactionType

  const filteredEvents = result?.result?.response.events
    .filter((event: TransactionEvent) => eventTypes.includes(event.type))
    .flat()

  filteredEvents.forEach((event: TransactionEvent) => {
    // If the event is 'begin_unlock' the transaction type is 'unlock'
    // The SC team will update the begin_unlock to be a wasm event, with funds in the action
    // as soon as the update is live, this can be moved to getTransactionCoinsGrouped()
    if (event.type === 'begin_unlock') transactionType = 'unlock'

    if (event.type === 'wasm') {
      const action = event.attributes.find((a) => a.key === 'action')?.value ?? ''
      const foundTransactionType = transactionTypes.get(action)
      if (foundTransactionType) transactionType = foundTransactionType
    }
  })

  return transactionType
}

function getVaultTokensFromEvent(event: TransactionEvent): BNCoin[] | undefined {
  const denomAndAmountStringArray = event.attributes
    .find((a) => a.key === 'tokens_in' || a.key === 'coins_out' || a.key === 'assets')
    ?.value.split(',')
  if (!denomAndAmountStringArray) return
  if (denomAndAmountStringArray.length !== 2) return
  const vaultToken1 = getCoinFromAmountDenomString(denomAndAmountStringArray[0].trim())
  const vaultToken2 = getCoinFromAmountDenomString(denomAndAmountStringArray[1].trim())
  if (!vaultToken1 || !vaultToken2) return
  return [vaultToken1, vaultToken2]
}

function getCoinFromAmountDenomString(amountDenomString: string): BNCoin | undefined {
  if (amountDenomString.charAt(0) === '0')
    return BNCoin.fromDenomAndBigNumber(amountDenomString.substring(1), BN_ZERO)
  const regex = /(?:(\d+).*)/g
  const matches = regex.exec(amountDenomString)
  if (!matches || matches.length < 2) return
  const denom = amountDenomString.split(matches[1])[1]
  return BNCoin.fromDenomAndBigNumber(denom, BN(matches[1]))
}

function groupTransactionCoins(coins: TransactionCoin[]): GroupedTransactionCoin[] {
  // Group coins by type so that for example multiple deposit objects are passed as a single deposit array
  const reducedCoins = coins.reduce((grouped, coin) => {
    const existingGroup = grouped.find((g) => g.type === coin.type)

    if (existingGroup) {
      existingGroup.coins.push(coin)
      return grouped
    }

    grouped.push({ type: coin.type, coins: [coin] })
    return grouped
  }, [] as GroupedTransactionCoin[])

  // Check for vault transactions and remove lend actions from it
  const hasVaultTransaction = reducedCoins.find((c) => c.type === 'deposit_into_vault')
  if (hasVaultTransaction) {
    const lendIndex = reducedCoins.findIndex((c) => c.type === 'lend')
    if (lendIndex > -1) reducedCoins.splice(lendIndex, 1)
  }

  return reducedCoins
}

export function getToastContentsAndMutationKeysFromGroupedTransactionCoin(
  transactionCoin: GroupedTransactionCoin,
  isHls: boolean,
  target: string,
  chainConfig: ChainConfig,
  assets: Asset[],
): { content: ToastContent[]; mutationKeys: string[] } {
  const toastContents = [] as ToastContent[]
  const coins = transactionCoin.coins.map((c) => c.coin.toCoin())
  const mutationKeys = getMutationKeyFromTransactionCoinType(transactionCoin.type, chainConfig)

  switch (transactionCoin.type) {
    case 'perps':
      transactionCoin.coins.forEach((txCoin) => {
        mutationKeys.push(
          `chains/${chainConfig.id}/perps/updatePosition/${txCoin.coin.denom}/##ACCOUNTORWALLET##`,
        )
        if (!txCoin.before) return
        const type = getPerpsTransactionTypeFromCoin({ coin: txCoin.coin, before: txCoin.before })
        const perpsAssetSymbol = getAssetSymbolByDenom(txCoin.coin.denom, assets)

        const beforeTradeDirection: TradeDirection = txCoin.before.amount.isPositive()
          ? 'long'
          : 'short'
        const afterTradeDirection: TradeDirection = txCoin.coin.amount.isPositive()
          ? 'long'
          : 'short'

        const modificationAnmount = txCoin.coin.amount.abs().minus(txCoin.before.amount.abs())
        const modificationCoin = BNCoin.fromDenomAndBigNumber(
          txCoin.coin.denom,
          modificationAnmount,
        )

        switch (type) {
          case 'open':
            toastContents.push({
              text: txCoin.coin.amount.isPositive()
                ? `Opened ${perpsAssetSymbol} long`
                : `Opened ${perpsAssetSymbol} short`,
              coins: [txCoin.coin.abs().toCoin()],
            })
            break

          case 'close':
            toastContents.push({
              text: txCoin.before.amount.isPositive()
                ? `Closed ${perpsAssetSymbol} long`
                : `Closed ${perpsAssetSymbol} short`,
              coins: [modificationCoin.abs().toCoin()],
            })
            break

          case 'modify':
            if (beforeTradeDirection !== afterTradeDirection && !txCoin.coin.amount.isZero()) {
              toastContents.push({
                text: `Switched ${perpsAssetSymbol} from ${beforeTradeDirection} to ${afterTradeDirection}`,
                coins: [txCoin.coin.abs().toCoin()],
              })
              return
            }
            toastContents.push({
              text: modificationAnmount.isPositive()
                ? `Increased ${perpsAssetSymbol} ${afterTradeDirection} by`
                : `Decreased ${perpsAssetSymbol} ${afterTradeDirection} by`,
              coins: [modificationCoin.abs().toCoin()],
            })

            break
        }
      })

      break
    case 'borrow':
      toastContents.push({
        text: 'Borrowed',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'perpsPnl':
      const perpsPnlCoins = transactionCoin.coins.map((c) => c.coin)
      perpsPnlCoins.forEach((coin) => {
        if (BN(coin.amount).isPositive()) {
          toastContents.push({
            text: 'Realized profit',
            coins: [coin.toCoin()],
          })
        }
        if (BN(coin.amount).isNegative()) {
          toastContents.push({
            text: 'Realized loss',
            coins: [coin.abs().toCoin()],
          })
        }
      })
      break
    case 'deposit':
      toastContents.push({
        text: isHls ? 'Deposited into Hls account' : 'Deposited',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'deposit_from_wallet':
      toastContents.push({
        text: 'Deposited from wallet',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'lend':
      toastContents.push({
        text: target === 'Red Bank' ? 'Deposited' : 'Lent',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'reclaim':
      toastContents.push({
        text: 'Unlent',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'repay':
      toastContents.push({
        text: 'Repaid',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'swap':
      toastContents.push({
        text: 'Swapped',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'withdraw':
      toastContents.push({
        text: 'Withdrew to wallet',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'farm':
      toastContents.push({
        text:
          coins.length === 2
            ? `Withdrew from ${getAssetSymbolByDenom(coins[0].denom, assets)}-${getAssetSymbolByDenom(coins[1].denom, assets)}`
            : 'Withdrew from farm',
        coins,
      })
      break
    case 'provide_liquidity':
      toastContents.push({
        text:
          coins.length === 2
            ? `Added to ${getAssetSymbolByDenom(coins[0].denom, assets)}-${getAssetSymbolByDenom(coins[1].denom, assets)}`
            : 'Deposited into farm',
        coins,
      })
      break
    case 'deposit_into_vault':
      const depositVaultCoins = transactionCoin.coins.map((c) => c.coin.toCoin())
      toastContents.push({
        text:
          transactionCoin.coins.length === 2
            ? `Deposited into the ${getVaultNameByCoins(chainConfig, depositVaultCoins)} vault`
            : `Deposited into the Perps ${getAssetSymbolByDenom(depositVaultCoins[0].denom, assets)} vault`,
        coins: depositVaultCoins,
      })
      break
    case 'perpsOpeningFee':
      toastContents.push({
        text: 'Payed Opening Fee',
        coins: removeEmptyCoins(coins),
      })
      break
    case 'perpsClosingFee':
      toastContents.push({
        text: 'Payed Closing Fee',
        coins: removeEmptyCoins(coins),
      })
      break

    case 'claim_rewards':
      toastContents.push({
        text: 'Claimed rewards',
        coins: removeEmptyCoins(coins),
      })
      break

    case 'cancel-order':
      toastContents.push({
        text: 'Canceled a Limit Order',
        coins,
      })
      break

    case 'create-order':
      toastContents.push({
        text: 'Created a Limit Order',
        coins,
      })
      toastContents.push({
        text: 'Payed the Keeper Fee',
        coins,
      })
      break
  }

  return {
    content: toastContents,
    mutationKeys,
  }
}

function getMutationKeyFromTransactionCoinType(
  transactionType: TransactionCoinType,
  chainConfig: ChainConfig,
): string[] {
  const mutationKeys = [] as string[]

  mutationKeys.push(`chains/${chainConfig.id}/accounts/##ACCOUNTORWALLET##`)

  switch (transactionType) {
    case 'perps':
      mutationKeys.push(`chains/${chainConfig.id}/perps/market-states`)
      break
    case 'borrow':
    case 'lend':
    case 'reclaim':
    case 'swap':
    case 'repay':
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/balances`,
        `chains/${chainConfig.id}/markets/depositCap`,
        `chains/${chainConfig.id}/markets`,
        `chains/${chainConfig.id}/markets/info`,
      )
      break
    case 'deposit':
    case 'deposit_from_wallet':
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/balances`,
        `chains/${chainConfig.id}/wallets/##ADDRESS##/account-ids`,
        `chains/${chainConfig.id}/accounts/default`,
        `chains/${chainConfig.id}/markets/depositCap`,
        `chains/${chainConfig.id}/markets`,
        `chains/${chainConfig.id}/markets/info`,
      )
      break
    case 'withdraw':
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/balances`,
        `chains/${chainConfig.id}/accounts/##ACCOUNTORWALLET##/staked-astro-lp-rewards`,
        `chains/${chainConfig.id}/vaults`,
      )
      break
    case 'farm':
      mutationKeys.push(
        `chains/${chainConfig.id}/wallets/##ADDRESS##/balances`,
        `chains/${chainConfig.id}/accounts/##ACCOUNTORWALLET##/unclaimed-rewards`,
      )
      break
    case 'provide_liquidity':
      mutationKeys.push(
        `chains/${chainConfig.id}/accounts/##ACCOUNTORWALLET##/staked-astro-lp-rewards`,
      )
      break
    case 'deposit_into_vault':
      mutationKeys.push(
        `chains/${chainConfig.id}/vaults/##ACCOUNTORWALLET##/deposited`,
        `chains/${chainConfig.id}/vaults/##ACCOUNTORWALLET##`,
        `chains/${chainConfig.id}/vaults/aprs`,
        `chains/${chainConfig.id}/perps/vault`,
      )
      break
    case 'claim_rewards':
      mutationKeys.push(
        `chains/${chainConfig.id}/accounts/##ACCOUNTORWALLET##/staked-astro-lp-rewards`,
      )
      break
    case 'cancel-order':
    case 'create-order':
      mutationKeys.push(`chains/${chainConfig.id}/perps/limit-orders/##ACCOUNTORWALLET##`)
      break
  }

  return mutationKeys
}

function getPerpsTransactionTypeFromCoin(txCoin: {
  coin: BNCoin
  before: BNCoin
}): PerpsTransactionType {
  // if amount of the before positon was 0 -> opened a new position
  if (txCoin.before.amount.isZero()) return 'open'
  // if amount of the new position is 0 -> close position
  if (txCoin.coin.amount.isZero()) return 'close'
  return 'modify'
}

export function sortFunds(funds: Coin[]) {
  // FIX:
  // Transaction failed: Broadcasting transaction failed with code 10 (codespace: sdk). Log: sentFunds: invalid coins
  // Transaction on Osmosis fail, if uosmo is not at the last position of the funds array
  return funds.sort((a, b) => a.denom.localeCompare(b.denom))
}
