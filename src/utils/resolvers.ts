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
    borrowRate: convertAprToApy(Number(marketResponse.borrow_rate), 365) * 100,
    debtTotalScaled: marketResponse.debt_total_scaled,
    collateralTotalScaled: marketResponse.collateral_total_scaled,
    depositEnabled: assetParamsResponse.red_bank.deposit_enabled,
    borrowEnabled: assetParamsResponse.red_bank.borrow_enabled,
    cap: {
      denom: assetCapResponse.denom,
      used: BN(assetCapResponse.amount),
      max: BN(assetParamsResponse.deposit_cap),
    },
    maxLtv: Number(assetParamsResponse.max_loan_to_value),
    liquidityRate: Number(marketResponse.liquidity_rate) * 100,
    liquidationThreshold: Number(assetParamsResponse.liquidation_threshold),
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
