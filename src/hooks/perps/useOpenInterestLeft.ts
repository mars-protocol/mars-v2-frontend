import { BN_ONE } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import usePerpsMarketState from 'hooks/perps/usePerpsMarketState'
import { BN } from 'utils/helpers'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export function useOpenInterestLeft() {
  const { perpsAsset } = usePerpsAsset()
  const perpsMarket = usePerpsMarketState()
  const params = usePerpsParams(perpsAsset?.denom)

  const calculateOpenInterestLeft = (
    oiValue: BigNumber | string | undefined,
    maxOi: BigNumber | string | undefined,
  ) => {
    const oiUsd = BN(oiValue ?? '0').shiftedBy(-PRICE_ORACLE_DECIMALS)
    const maxOiUsd = BN(maxOi ?? '0').shiftedBy(-PRICE_ORACLE_DECIMALS)
    return maxOiUsd.minus(oiUsd).div(perpsAsset?.price?.amount ?? BN_ONE)
  }

  const longOpenInterestLeft = calculateOpenInterestLeft(
    perpsMarket?.long_oi_value,
    params?.maxOpenInterestLong,
  )

  const shortOpenInterestLeft = calculateOpenInterestLeft(
    perpsMarket?.short_oi_value,
    params?.maxOpenInterestShort,
  )

  return {
    longOpenInterestLeft,
    shortOpenInterestLeft,
  }
}
