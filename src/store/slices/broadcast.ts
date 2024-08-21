import { DEFAULT_GAS_MULTIPLIER, MsgExecuteContract } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { isMobile } from 'react-device-detect'
import { StoreApi } from 'zustand'

import getGasPrice from 'api/gasPrice/getGasPrice'
import getPythPriceData from 'api/prices/getPythPriceData'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { ExecuteMsg as AccountNftExecuteMsg } from 'types/generated/mars-account-nft/MarsAccountNft.types'
import {
  Action,
  ActionCoin,
  Action as CreditManagerAction,
  ExecuteMsg as CreditManagerExecuteMsg,
  ExecuteMsg,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ExecuteMsg as IncentivesExecuteMsg } from 'types/generated/mars-incentives/MarsIncentives.types'
import { ExecuteMsg as RedBankExecuteMsg } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { AccountKind } from 'types/generated/mars-rover-health-types/MarsRoverHealthTypes.types'
import { byDenom, bySymbol } from 'utils/array'
import { generateErrorMessage, getSingleValueFromBroadcastResult, sortFunds } from 'utils/broadcast'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'
import checkPythUpdateEnabled from 'utils/checkPythUpdateEnabled'
import { defaultFee } from 'utils/constants'
import { setAutoLendForAccount } from 'utils/autoLend'
import { generateToast } from 'utils/generateToast'
import { BN } from 'utils/helpers'
import { getSwapExactInAction } from 'utils/swap'

function generateExecutionMessage(
  sender: string | undefined = '',
  contract: string,
  msg:
    | CreditManagerExecuteMsg
    | AccountNftExecuteMsg
    | RedBankExecuteMsg
    | PythUpdateExecuteMsg
    /* PERPS
    | PerpsExecuteMsg
    */
    | IncentivesExecuteMsg,
  funds: Coin[],
) {
  return new MsgExecuteContract({
    sender,
    contract,
    msg,
    funds,
  })
}

export default function createBroadcastSlice(
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
): BroadcastSlice {
  const getEstimatedFee = async (messages: MsgExecuteContract[]) => {
    if (!get().client) {
      return defaultFee(get().chainConfig)
    }
    try {
      const gasPrice = await getGasPrice(get().chainConfig)

      const simulateResult = await get().client?.simulate({
        messages,
        wallet: get().client?.connectedWallet,
        overrides: {
          gasPrice,
          gasAdjustment: DEFAULT_GAS_MULTIPLIER,
        },
      })

      if (simulateResult) {
        const { success } = simulateResult
        if (success) {
          const fee = simulateResult.fee
          return {
            amount: fee.amount,
            gas: BN(fee.gas).toFixed(0),
          }
        }
      }

      throw 'Simulation failed'
    } catch (ex) {
      return defaultFee(get().chainConfig)
    }
  }

  return {
    toast: null,
    addToStakingStrategy: async (options: {
      accountId: string
      actions: Action[]
      depositCoin: BNCoin
      borrowCoin: BNCoin
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, cmContract, msg, [options.depositCoin.toCoin()]),
        ],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    execute: async (contract: string, msg: ExecuteMsg, funds: Coin[]) => {
      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, contract, msg, sortFunds(funds))],
      })
      get().handleTransaction({ response })

      return response
    },
    borrow: async (options: { accountId: string; coin: BNCoin; borrowToWallet: boolean }) => {
      const borrowAction: Action = { borrow: options.coin.toCoin() }
      const withdrawAction: Action = { withdraw: options.coin.toActionCoin() }
      const actions = options.borrowToWallet ? [borrowAction, withdrawAction] : [borrowAction]

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      if (
        !options.borrowToWallet &&
        checkAutoLendEnabled(options.accountId, get().chainConfig.id) &&
        get().assets.find(byDenom(options.coin.denom))?.isAutoLendEnabled
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.coin.denom, amount: 'account_balance' },
        })
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    changeHlsStakingLeverage: async (options: { accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    closeHlsStakingPosition: async (options: { accountId: string; actions: Action[] }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },

    createAccount: async (accountKind: AccountKind, isAutoLendEnabled: boolean) => {
      const msg: CreditManagerExecuteMsg = {
        create_credit_account: accountKind,
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      const accountId = await response.then((response) =>
        response.result
          ? getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
          : null,
      )

      if (accountId && isAutoLendEnabled) {
        setAutoLendForAccount(get().chainConfig.id, accountId)
      }
      return accountId
    },

    deleteAccount: async (options: { accountId: string; lends: BNCoin[] }) => {
      const reclaimMsg = options.lends.map((coin) => {
        return {
          reclaim: coin.toActionCoin(true),
        }
      })

      const refundMessage: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...reclaimMsg, { refund_all_coin_balances: {} }],
        },
      }

      const burnMessage: AccountNftExecuteMsg = {
        burn: {
          token_id: options.accountId,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager
      const nftContract = get().chainConfig.contracts.accountNft

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(get().address, cmContract, refundMessage, []),
          generateExecutionMessage(get().address, nftContract, burnMessage, []),
        ],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    claimRewards: async (options: {
      accountId: string
      redBankRewards?: BNCoin[]
      stakedAstroLpRewards?: StakedAstroLpRewards[]
      lend: boolean
    }) => {
      const redBankRewards = options.redBankRewards ?? []
      const stakedAstroLpRewards = options.stakedAstroLpRewards ?? []

      const isV1 = get().isV1
      const actions = [] as Action[]
      const assets = get().assets
      const lendCoins = [] as BNCoin[]

      if (redBankRewards.length > 0)
        actions.push({
          claim_rewards: {},
        })

      if (stakedAstroLpRewards.length > 0) {
        for (const reward of stakedAstroLpRewards) {
          actions.push({
            claim_astro_lp_rewards: {
              lp_denom: reward.lpDenom,
            },
          })
        }
      }

      if (!isV1 && options.lend && stakedAstroLpRewards.length) {
        for (const reward of stakedAstroLpRewards) {
          for (const coin of reward.rewards) {
            const asset = assets.find(byDenom(coin.denom))
            if (asset?.isAutoLendEnabled && !lendCoins.find(byDenom(coin.denom))) {
              lendCoins.push(coin)
              actions.push({
                lend: {
                  denom: coin.denom,
                  amount: 'account_balance',
                },
              })
            }
          }
        }
      }

      if (!isV1 && options.lend && redBankRewards.length) {
        for (const coin of redBankRewards) {
          const asset = assets.find(byDenom(coin.denom))
          if (asset?.isAutoLendEnabled && !lendCoins.find(byDenom(coin.denom))) {
            actions.push({
              lend: {
                denom: coin.denom,
                amount: 'account_balance',
              },
            })
          }
        }
      }

      const creditManagerMsg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      const incentivesMsg: IncentivesExecuteMsg = {
        claim_rewards: {},
      }
      const contract = isV1
        ? get().chainConfig.contracts.incentives
        : get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            contract,
            isV1 ? incentivesMsg : creditManagerMsg,
            [],
          ),
        ],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    deposit: async (options: {
      accountId?: string
      coins: BNCoin[]
      lend: boolean
      isAutoLend?: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          ...(options.accountId ? { account_id: options.accountId } : {}),
          actions: options.coins.map((coin) => ({
            deposit: coin.toCoin(),
          })),
        },
      }
      if (options.lend) {
        msg.update_credit_account.actions.push(
          ...options.coins
            .filter((coin) => get().assets.find(byDenom(coin.denom))?.isAutoLendEnabled)
            .map((coin) => ({ lend: coin.toActionCoin() })),
        )
      }

      const funds = options.coins.map((coin) => coin.toCoin())
      const cmContract = get().chainConfig.contracts.creditManager
      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, sortFunds(funds))],
      })
      get().handleTransaction({ response })

      const accountId = await response.then((response) =>
        response.result
          ? getSingleValueFromBroadcastResult(response.result, 'wasm', 'token_id')
          : null,
      )

      if (accountId && options.isAutoLend) {
        setAutoLendForAccount(get().chainConfig.id, accountId)
      }

      return accountId
    },
    unlock: async (options: { accountId: string; vault: DepositedVault; amount: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              request_vault_unlock: {
                vault: { address: options.vault.address },
                amount: options.amount,
              },
            },
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    withdrawFromVaults: async (options: {
      accountId: string
      vaults: DepositedVault[]
      slippage: number
    }) => {
      const actions: CreditManagerAction[] = []
      options.vaults.forEach((vault) => {
        if (vault.unlockId && vault.type === 'normal') {
          actions.push({
            exit_vault_unlocked: {
              id: vault.unlockId,
              vault: { address: vault.address },
            },
          })
          actions.push({
            withdraw_liquidity: {
              lp_token: { denom: vault.denoms.lp, amount: 'account_balance' },
              slippage: options.slippage.toString(),
            },
          })
        }
        /* PERPS
        if (vault.type === 'perp') {
          actions.push({
            withdraw_from_perp_vault: {},
          })
        }
        */
      })
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      if (checkAutoLendEnabled(options.accountId, get().chainConfig.id)) {
        for (const vault of options.vaults) {
          for (const symbol of Object.values(vault.symbols)) {
            const asset = get().assets.find(bySymbol(symbol))
            if (asset?.isAutoLendEnabled) {
              msg.update_credit_account.actions.push({
                lend: { denom: asset.denom, amount: 'account_balance' },
              })
            }
          }
        }
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    depositIntoFarm: async (options: {
      accountId: string
      actions: Action[]
      deposits: BNCoin[]
      borrowings: BNCoin[]
      kind: AccountKind
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: options.actions,
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            cmContract,
            msg,
            options.kind === 'default' ? [] : options.deposits.map((coin) => coin.toCoin()),
          ),
        ],
      })
      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    withdrawFromAstroLps: async (options: {
      accountId: string
      astroLps: DepositedAstroLp[]
      amount: string
    }) => {
      const actions: CreditManagerAction[] = []

      options.astroLps.forEach((astroLp) => {
        const coin = BNCoin.fromCoin({
          denom: astroLp.denoms.lp,
          amount: options.amount,
        }).toActionCoin()

        actions.push({
          unstake_astro_lp: {
            lp_token: coin,
          },
        })
        actions.push({
          withdraw_liquidity: {
            lp_token: coin,
            slippage: '0',
          },
        })
      })
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions,
        },
      }

      if (checkAutoLendEnabled(options.accountId, get().chainConfig.id)) {
        for (const astroLp of options.astroLps) {
          for (const symbol of Object.values(astroLp.symbols)) {
            const asset = get().assets.find(bySymbol(symbol))
            if (asset?.isAutoLendEnabled) {
              msg.update_credit_account.actions.push({
                lend: { denom: asset.denom, amount: 'account_balance' },
              })
            }
          }
        }
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    withdraw: async (options: {
      accountId: string
      coins: Array<{ coin: BNCoin; isMax?: boolean }>
      borrow: BNCoin[]
      reclaims: ActionCoin[]
    }) => {
      const reclaimActions = options.reclaims.map((coin) => ({
        reclaim: coin,
      }))
      const withdrawActions = options.coins.map(({ coin, isMax }) => ({
        withdraw: coin.toActionCoin(isMax),
      }))
      const borrowActions = options.borrow.map((coin) => ({
        borrow: coin.toCoin(),
      }))
      const cmContract = get().chainConfig.contracts.creditManager

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [...reclaimActions, ...borrowActions, ...withdrawActions],
        },
      }

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    repay: async (options: {
      accountId: string
      coin: BNCoin
      accountBalance?: boolean
      lend?: BNCoin
      fromWallet?: boolean
    }) => {
      const actions: Action[] = [
        {
          repay: {
            coin: options.coin.toActionCoin(options.accountBalance),
          },
        },
      ]

      if (options.lend && options.lend.amount.isGreaterThan(0))
        actions.unshift({ reclaim: options.lend.toActionCoin() })

      const msg: CreditManagerExecuteMsg = options.fromWallet
        ? {
            repay_from_wallet: {
              account_id: options.accountId,
            },
          }
        : {
            update_credit_account: {
              account_id: options.accountId,
              actions,
            },
          }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [
          generateExecutionMessage(
            get().address,
            cmContract,
            msg,
            options.fromWallet ? [options.coin.toCoin()] : [],
          ),
        ],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    lend: async (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              lend: options.coin.toActionCoin(options.isMax),
            },
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })
      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    reclaim: async (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            {
              reclaim: options.coin.toActionCoin(options.isMax),
            },
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    swap: (options: {
      accountId: string
      coinIn: BNCoin
      reclaim?: BNCoin
      borrow?: BNCoin
      denomOut: string
      slippage?: number
      isMax?: boolean
      repay: boolean
      routeInfo: SwapRouteInfo
    }) => {
      const isOsmosis = get().chainConfig.isOsmosis

      const swapExactIn = getSwapExactInAction(
        options.coinIn.toActionCoin(options.isMax),
        options.denomOut,
        options.routeInfo,
        options.slippage ?? 0,
        isOsmosis,
      )

      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            ...(options.reclaim ? [{ reclaim: options.reclaim.toActionCoin() }] : []),
            ...(options.borrow ? [{ borrow: options.borrow.toCoin() }] : []),
            swapExactIn,
            ...(options.repay
              ? [
                  {
                    repay: {
                      coin: BNCoin.fromDenomAndBigNumber(options.denomOut, BN_ZERO).toActionCoin(
                        true,
                      ),
                    },
                  },
                ]
              : []),
          ],
        },
      }

      if (
        checkAutoLendEnabled(options.accountId, get().chainConfig.id) &&
        get().assets.find(byDenom(options.denomOut))?.isAutoLendEnabled &&
        !options.repay
      ) {
        msg.update_credit_account.actions.push({
          lend: { denom: options.denomOut, amount: 'account_balance' },
        })
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const messages = [generateExecutionMessage(get().address, cmContract, msg, [])]

      const estimateFee = () => getEstimatedFee(messages)

      const execute = async () => {
        const response = get().executeMsg({
          messages,
        })

        get().handleTransaction({ response })
        return response.then((response) => !!response.result)
      }

      return { estimateFee, execute }
    },
    resyncOracle: async () => {
      const response = get().executeMsg({
        messages: [],
        isPythUpdate: true,
      })

      get().handleTransaction({ response, message: 'Oracle updated successfully!' })
      return response.then((response) => !!response.result)
    },
    handleTransaction: (options: { response: Promise<BroadcastResult>; message?: string }) => {
      const { response, message } = options
      const id = moment().unix()
      const toastOptions: Partial<ToastObjectOptions> = {
        id,
        message,
      }

      set({
        mobileNavExpanded: false,
        toast: {
          id,
          promise: response,
        },
      })

      response.then((r): void => {
        if (r.error || r.result?.response.code !== 0) {
          set({
            toast: {
              id,
              message: generateErrorMessage(r),
              isError: true,
              hash: r.result?.hash,
            },
          })
          return
        }

        const toast = generateToast(
          get().chainConfig,
          r,
          toastOptions,
          get().address ?? '',
          get().assets,
        )
        toast.then((t) => set({ toast: t }))
        return
      })
    },
    executeMsg: async (options: {
      messages: MsgExecuteContract[]
      isPythUpdate?: boolean
    }): Promise<BroadcastResult> => {
      try {
        const client = get().client
        const isV1 = get().isV1
        const isLedger = client?.connectedWallet?.account.isLedger
        const memo = isLedger ? '' : isV1 ? 'MPv1' : 'MPv2'

        const gasPrice = await getGasPrice(get().chainConfig)
        if (!client)
          return { result: undefined, error: 'No client detected. Please reconnect your wallet.' }
        if ((checkPythUpdateEnabled() || options.isPythUpdate) && !isLedger) {
          const pythUpdateMsg = await get().getPythVaas()
          options.messages.unshift(pythUpdateMsg)
        }
        const fee = await getEstimatedFee(options.messages)
        const broadcastOptions = {
          messages: options.messages,
          feeAmount: fee.amount[0].amount,
          gasLimit: fee.gas,
          memo,
          wallet: client.connectedWallet,
          mobile: isMobile,
          overrides: {
            gasPrice,
            gasAdjustment: DEFAULT_GAS_MULTIPLIER,
          },
        }
        const result = await client.broadcast(broadcastOptions)
        if (result.hash) {
          return { result }
        }

        return {
          result: undefined,
          error: 'Transaction failed',
        }
      } catch (error) {
        const e = error as { message: string }
        console.log(e)
        return { result: undefined, error: e.message }
      }
    },
    openPerpPosition: async (options: { accountId: string; coin: BNCoin }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            /* PERPS
            {
              open_perp: options.coin.toSignedCoin(),
            },
             */
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      return response.then((response) => !!response.result)
    },
    closePerpPosition: async (options: { accountId: string; denom: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            /* PERPS
            {
              close_perp: { denom: options.denom },
            },
            */
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    modifyPerpPosition: async (options: {
      accountId: string
      coin: BNCoin
      changeDirection: boolean
    }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            /* PERPS
            ...(options.changeDirection
              ? [

                  {
                    close_perp: {
                      denom: options.coin.denom,
                    },
                  },
                  {
                    open_perp: options.coin.toSignedCoin(),
                  },
                ]
              : [
                  {
                    modify_perp: {
                      denom: options.coin.denom,
                      new_size: options.coin.amount.toString() as any,
                    },
                  },
                ]),
                */
          ],
        },
      }

      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    getPythVaas: async () => {
      const priceFeedIds = get()
        .assets.filter((asset) => !!asset.pythPriceFeedId)
        .map((asset) => asset.pythPriceFeedId as string)
      const pricesData = await getPythPriceData(priceFeedIds)
      const msg: PythUpdateExecuteMsg = { update_price_feeds: { data: pricesData } }
      const pythAssets = get().assets.filter((asset) => !!asset.pythPriceFeedId)
      const pythContract = get().chainConfig.contracts.pyth

      return generateExecutionMessage(get().address, pythContract, msg, [
        { denom: get().assets[0].denom, amount: String(pythAssets.length) },
      ])
    },
    v1Action: async (type: V1ActionType, coin: BNCoin) => {
      let msg: RedBankExecuteMsg
      let toastOptions: ToastObjectOptions = {
        accountId: get().address,
      }
      let funds: Coin[] = []

      switch (type) {
        case 'withdraw':
          msg = {
            withdraw: {
              amount: coin.amount.toString(),
              denom: coin.denom,
            },
          }
          toastOptions = {
            ...toastOptions,
          }
          break
        case 'repay':
          msg = {
            repay: {},
          }
          funds = [coin.toCoin()]
          break
        case 'borrow':
          msg = {
            borrow: {
              amount: coin.amount.toString(),
              denom: coin.denom,
            },
          }
          toastOptions = {
            ...toastOptions,
          }
          break
        default:
          msg = {
            deposit: {},
          }
          funds = [coin.toCoin()]
      }

      const redBankContract = get().chainConfig.contracts.redBank

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, redBankContract, msg, sortFunds(funds))],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },

    depositIntoPerpsVault: async (options: {
      accountId: string
      denom: string
      fromDeposits?: BigNumber
      fromLends?: BigNumber
    }) => {
      const depositCoin = BNCoin.fromDenomAndBigNumber(
        options.denom,
        (options.fromDeposits || BN_ZERO).plus(options.fromLends || BN_ZERO),
      )
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            ...(options.fromLends
              ? [
                  {
                    reclaim: BNCoin.fromDenomAndBigNumber(
                      options.denom,
                      options.fromLends,
                    ).toActionCoin(),
                  },
                ]
              : []),
            /* PERPS
            {
              deposit_to_perp_vault: depositCoin.toActionCoin(),
            },
            */
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })
      const response_1 = await response
      return !!response_1.result
    },
    requestUnlockPerpsVault: (options: { accountId: string; amount: BigNumber }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            /* PERPS
            {
              unlock_from_perp_vault: {
                shares: options.amount.integerValue().toString(),
              },
            },
            */
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager

      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
    withdrawFromPerpsVault: (options: { accountId: string }) => {
      const msg: CreditManagerExecuteMsg = {
        update_credit_account: {
          account_id: options.accountId,
          actions: [
            /* PERPS
            {
              withdraw_from_perp_vault: {},
            },
            */
          ],
        },
      }
      const cmContract = get().chainConfig.contracts.creditManager
      const response = get().executeMsg({
        messages: [generateExecutionMessage(get().address, cmContract, msg, [])],
      })

      get().handleTransaction({ response })

      return response.then((response) => !!response.result)
    },
  }
}
