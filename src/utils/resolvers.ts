import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { PnL, Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  AssetParamsBaseForAddr as AssetParams,
  AssetParamsBaseForAddr,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { BN, getLeverageFromLTV } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'

export function resolveMarketResponse(
  marketResponse: RedBankMarket,
  assetParamsResponse: AssetParams,
  assetCapResponse: TotalDepositResponse,
): Market {
  return {
    denom: marketResponse.denom,
    apy: {
      borrow: convertAprToApy(Number(marketResponse.borrow_rate), 365) * 100,
      deposit: convertAprToApy(Number(marketResponse.liquidity_rate), 365) * 100,
    },
    debtTotalScaled: marketResponse.debt_total_scaled,
    collateralTotalScaled: marketResponse.collateral_total_scaled,
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

export function resolvePerpsPositions(perpPositions: Positions['perps']): PerpsPosition[] {
  return perpPositions.map((position) => {
    return {
      denom: position.denom,
      baseDenom: position.base_denom,
      size: BN(position.size as any).abs(),
      tradeDirection: BN(position.size as any).isNegative() ? 'short' : 'long',
      closingFee: BNCoin.fromCoin(position.pnl.coins.closing_fee),
      pnl: getPnlCoin(position.pnl.coins.pnl, position.base_denom),
      entryPrice: BN(position.entry_price),
    }
  })
}

function getPnlCoin(pnl: PnL, denom: string): BNCoin {
  let amount = BN_ZERO

  if (pnl === 'break_even') return BNCoin.fromDenomAndBigNumber(denom, amount)

  if ('loss' in (pnl as any)) {
    amount = BN((pnl as any).loss.amount).times(-1)
  } else if ('profit' in (pnl as { profit: Coin })) {
    amount = BN((pnl as any).profit.amount)
  }

  return BNCoin.fromDenomAndBigNumber(denom, amount)
}
