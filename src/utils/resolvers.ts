import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
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

export function resolvePerpsPositions(perpPositions: Positions['perps']): PerpsPosition[] {
  if (!perpPositions) return []
  return perpPositions.map((position) => {
    return {
      denom: position.denom,
      baseDenom: position.base_denom,
      amount: BN(position.size as any).abs(),
      tradeDirection: BN(position.size as any).isNegative() ? 'short' : 'long',
      closingFee: BNCoin.fromCoin(position.pnl.coins.closing_fee),
      pnl: {
        realized: {
          net: BNCoin.fromDenomAndBigNumber(position.base_denom, BN_ZERO),
          price: BNCoin.fromDenomAndBigNumber(position.base_denom, BN_ZERO),
          funding: BNCoin.fromDenomAndBigNumber(position.base_denom, BN_ZERO),
          fees: BNCoin.fromDenomAndBigNumber(position.base_denom, BN_ZERO.times(-1)),
        },
        unrealized: {
          net: BN(position.pnl.values.pnl as any),
          price: BN(position.pnl.values.price_pnl as any),
          funding: BN(position.pnl.values.accrued_funding as any),
          fees: BN(position.pnl.values.closing_fee as any).times(-1),
        },
      },
      entryPrice: BN(position.entry_price),
    }
  })
}
