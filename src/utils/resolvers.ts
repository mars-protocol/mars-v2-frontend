import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import {
  PerpVaultUnlock,
  Positions,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
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
          deposit: correlatedDenom,
          borrow: asset.denom,
        },
      }),
    )
  })
  return HLSStakingStrategies
}

export function resolvePerpsPositions(
  perpPositions: Positions['perps'],
  assets: Asset[],
): PerpsPosition[] {
  if (!perpPositions || !perpPositions.length) return []
  const basePrice =
    assets.find((asset) => asset.denom === perpPositions[0].base_denom)?.price?.amount ?? BN_ZERO

  return perpPositions.map((position) => {
    return {
      denom: position.denom,
      baseDenom: position.base_denom,
      amount: BN(position.size as any), // Amount is negative for SHORT positions
      tradeDirection: BN(position.size as any).isNegative() ? 'short' : 'long',
      closingFeeRate: BN(position.closing_fee_rate),
      entryPrice: BN(position.entry_exec_price),
      currentPrice: BN(position.current_exec_price),
      pnl: {
        net: BNCoin.fromDenomAndBigNumber(
          position.base_denom,
          BN(position.unrealised_pnl.pnl as any)
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
            BN(position.unrealised_pnl.pnl as any),
          ),
          price: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.price_pnl as any),
          ),
          funding: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.accrued_funding as any),
          ),
          fees: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealised_pnl.closing_fee as any),
          ),
        },
      },
    }
  })
}

export function resolvePerpsVaultPositions(
  perpsVaultPositions?: Positions['perp_vault'],
): PerpsVaultPositions | null {
  if (!perpsVaultPositions) return null

  const [unlocking, unlockedAmount] = perpsVaultPositions.unlocks.reduce(
    (prev, curr) => {
      if (curr.cooldown_end * 1000 < Date.now()) {
        prev[1] = prev[1].plus(curr.amount)
        return prev
      }

      prev[0].push(curr)
      return prev
    },
    [[] as PerpVaultUnlock[], BN_ZERO],
  )

  return {
    denom: perpsVaultPositions.denom,
    active: BN(perpsVaultPositions.deposit.amount).isZero()
      ? null
      : {
          amount: BN(perpsVaultPositions.deposit.amount),
          shares: BN(perpsVaultPositions.deposit.shares),
        },
    unlocking: unlocking.map((position) => ({
      amount: BN(position.amount),
      unlocksAt: position.cooldown_end * 1000,
    })),
    unlocked: unlockedAmount.isZero() ? null : unlockedAmount,
  }
}
