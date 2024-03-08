import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions, UnlockState } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  AssetParamsBaseForAddr as AssetParams,
  AssetParamsBaseForAddr,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { BN, getLeverageFromLTV } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'

export function resolveMarketResponse(
  asset: Asset,
  marketResponse: RedBankMarket & Partial<Market>,
  assetParamsResponse: AssetParams,
  assetCapResponse: TotalDepositResponse,
): Market {
  try {
    return {
      asset,
      apy: {
        borrow: convertAprToApy(Number(marketResponse.borrow_rate), 365) * 100,
        deposit: convertAprToApy(Number(marketResponse.liquidity_rate), 365) * 100,
      },
      debt: marketResponse.debt ?? BN_ZERO,
      deposits: marketResponse.deposits ?? BN_ZERO,
      liquidity: marketResponse.liquidity ?? BN_ZERO,
      depositEnabled: assetParamsResponse.red_bank.deposit_enabled,
      borrowEnabled: assetParamsResponse.red_bank.borrow_enabled,
      cap: {
        denom: assetCapResponse.denom,
        used: BN(assetCapResponse.amount),
        max: BN(assetParamsResponse.deposit_cap),
      },
      ltv: {
        max: Number(assetParamsResponse.max_loan_to_value),
        liq: Number(assetParamsResponse.liquidation_threshold),
      },
    }
  } catch (e) {
    console.log(e)
    return {
      asset,
      apy: {
        borrow: 0,
        deposit: 0,
      },
      debt: BN_ZERO,
      deposits: BN_ZERO,
      liquidity: BN_ZERO,
      depositEnabled: false,
      borrowEnabled: false,
      cap: {
        denom: '',
        used: BN_ZERO,
        max: BN_ZERO,
      },
      ltv: {
        max: 0,
        liq: 0,
      },
    }
  }
}

export function resolveHLSStrategies(
  type: 'vault' | 'coin',
  assets: AssetParamsBaseForAddr[],
): HLSStrategyNoCap[] {
  const HLSStakingStrategies: HLSStrategyNoCap[] = []

  assets.forEach((asset) => {
    const correlations = asset.credit_manager.hls?.correlations.filter((correlation) => {
      return type in correlation
    })

    let correlatedDenoms: string[] | undefined

    if (type === 'coin') {
      correlatedDenoms = correlations
        ?.map((correlation) => (correlation as { coin: { denom: string } }).coin.denom)
        .filter((denoms) => !denoms.includes('gamm/pool/'))
    } else {
      correlatedDenoms = correlations?.map(
        (correlation) => (correlation as { vault: { addr: string } }).vault.addr,
      )
    }

    if (!correlatedDenoms?.length) return

    correlatedDenoms.forEach((correlatedDenom) =>
      HLSStakingStrategies.push({
        apy: null,
        maxLeverage: getLeverageFromLTV(+asset.credit_manager.hls!.max_loan_to_value),
        maxLTV: +asset.credit_manager.hls!.max_loan_to_value,
        denoms: {
          deposit: asset.denom,
          borrow: correlatedDenom,
        },
      }),
    )
  })
  return HLSStakingStrategies
}

export function resolvePerpsPositions(
  perpPositions: Positions['perps'],
  prices: BNCoin[],
): PerpsPosition[] {
  if (!perpPositions || !perpPositions.length) return []
  const basePrice =
    prices.find((price) => price.denom === perpPositions[0].base_denom)?.amount ?? BN_ZERO

  return perpPositions.map((position) => {
    return {
      denom: position.denom,
      baseDenom: position.base_denom,
      amount: BN(position.size as any), // Amount is negative for SHORT positions
      tradeDirection: BN(position.size as any).isNegative() ? 'short' : 'long',
      closingFeeRate: BN(position.closing_fee_rate),
      pnl: {
        net: BNCoin.fromDenomAndBigNumber(
          position.base_denom,
          BN(position.unrealised_pnl.values.pnl as any)
            .div(basePrice)
            .plus(position.realised_pnl.pnl as any),
        ),
        realized: {
          net: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realised_pnl.pnl as any),
          ),
          price: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realised_pnl.price_pnl as any),
          ),
          funding: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realised_pnl.accrued_funding as any),
          ),
          fees: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realised_pnl.closing_fee as any).plus(
              position.realised_pnl.opening_fee as any,
            ),
          ),
        },
        unrealized: {
          net: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.values.pnl as any).div(basePrice),
          ),
          price: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.values.price_pnl as any).div(basePrice),
          ),
          funding: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.values.accrued_funding as any).div(basePrice),
          ),
          fees: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.values.closing_fee as any).div(basePrice),
          ),
        },
      },
      entryPrice: BN(position.entry_price),
    }
  })
}

export function resolvePerpVaultPositions(
  perpVaultPositions?: Positions['perp_vault'],
): PerpVaultPositions | null {
  if (!perpVaultPositions) return null

  const [unlocking, unlockedAmount] = perpVaultPositions.unlocks.reduce(
    (prev, curr) => {
      if (curr.cooldown_end < Date.now()) {
        prev[1].plus(curr.amount)
        return prev
      }

      prev[0].push(curr)
      return prev
    },
    [[] as UnlockState[], BN_ZERO],
  )

  return {
    denom: perpVaultPositions.denom,
    active: BN(perpVaultPositions.deposit.amount).isZero()
      ? null
      : {
          amount: BN(perpVaultPositions.deposit.amount),
          shares: BN(perpVaultPositions.deposit.shares),
        },
    unlocking: unlocking.map((position) => ({
      amount: BN(position.amount),
      unlocksAt: position.cooldown_end,
    })),
    unlocked: unlockedAmount.isZero() ? null : unlockedAmount,
  }
}
