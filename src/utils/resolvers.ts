import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  AssetParamsBaseForAddr as AssetParams,
  AssetParamsBaseForAddr,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { VaultPositionResponse, VaultUnlock } from 'types/generated/mars-perps/MarsPerps.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { BN, getLeverageFromLTV } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'
import { getTokenPrice } from 'utils/tokens'

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
        borrow: convertAprToApy(Number(marketResponse.borrow_rate) * 100, 365),
        deposit: convertAprToApy(Number(marketResponse.liquidity_rate) * 100, 365),
      },
      debt: marketResponse.debt ?? BN_ZERO,
      deposits: marketResponse.deposits ?? BN_ZERO,
      liquidity: marketResponse.liquidity ?? BN_ZERO,
      depositEnabled: assetParamsResponse.red_bank.deposit_enabled,
      borrowEnabled: asset.isDeprecated ? true : assetParamsResponse.red_bank.borrow_enabled,
      cap: {
        denom: assetCapResponse.denom,
        used: BN(assetCapResponse.amount),
        // add a 0.5% cap buffer for assets, so that farms can still be swapped into on leverage
        max: asset.isDeprecated ? BN_ZERO : BN(assetParamsResponse.deposit_cap).times(0.95),
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

export function resolveHlsStrategies(
  type: 'vault' | 'coin',
  assets: AssetParamsBaseForAddr[],
): HlsStrategyNoCap[] {
  const HlsStakingStrategies: HlsStrategyNoCap[] = []

  assets.forEach((asset) => {
    const correlations = asset.credit_manager.hls?.correlations.filter((correlation) => {
      return type in correlation
    })

    let correlatedDenoms: string[] | undefined
    if (type === 'coin') {
      correlatedDenoms = correlations
        ?.map((correlation) => (correlation as { coin: { denom: string } }).coin.denom)
        .filter((denoms) => !denoms.includes('gamm/pool/') && !denoms.includes('/share'))
    } else {
      correlatedDenoms = correlations?.map(
        (correlation) => (correlation as { vault: { addr: string } }).vault.addr,
      )
    }
    if (!correlatedDenoms?.length) return

    correlatedDenoms.forEach((correlatedDenom) =>
      HlsStakingStrategies.push({
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
  return HlsStakingStrategies
}

export function resolvePerpsPositions(
  perpPositions: Positions['perps'],
  assets: Asset[],
): PerpsPosition[] {
  if (!perpPositions || !perpPositions.length) return []
  const basePrice = getTokenPrice(perpPositions[0].base_denom, assets)

  return perpPositions.map((position) => {
    return {
      type: 'market',
      denom: position.denom,
      baseDenom: position.base_denom,
      amount: BN(position.size as any), // Amount is negative for SHORT positions
      tradeDirection: BN(position.size as any).isNegative() ? 'short' : 'long',
      entryPrice: BN(position.entry_exec_price),
      currentPrice: BN(position.current_exec_price),
      pnl: {
        net: BNCoin.fromDenomAndBigNumber(
          position.base_denom,
          BN(position.unrealized_pnl.pnl as any)
            .div(basePrice)
            .plus(position.realized_pnl.pnl as any),
        ),
        realized: {
          net: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realized_pnl.pnl as any),
          ),
          price: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realized_pnl.price_pnl as any),
          ),
          funding: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realized_pnl.accrued_funding as any),
          ),
          fees: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.realized_pnl.closing_fee as any).plus(
              position.realized_pnl.opening_fee as any,
            ),
          ),
        },
        unrealized: {
          net: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealized_pnl.pnl as any),
          ),
          price: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealized_pnl.price_pnl as any),
          ),
          funding: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealized_pnl.accrued_funding as any),
          ),
          fees: BNCoin.fromDenomAndBigNumber(
            position.base_denom,
            BN(position.unrealized_pnl.closing_fee as any),
          ),
        },
      },
    }
  })
}

export function resolvePerpsVaultPositions(
  perpsVaultPositions?: VaultPositionResponse,
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
    [[] as VaultUnlock[], BN_ZERO],
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
