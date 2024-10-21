import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsMarketStates from './usePerpsMarketStates'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BN_ZERO } from 'constants/math'

export default function usePerpsFundingRates() {
  const currentAccount = useCurrentAccount()
  const { data: perpsMarketStates } = usePerpsMarketStates()
  const assets = usePerpsEnabledAssets()

  if (!currentAccount) return []

  const activePerpsPositions = currentAccount.perps.map((position) => {
    return {
      amount: position.amount,
      denom: position.denom,
      currentPrice: position.currentPrice,
    }
  })

  if (!perpsMarketStates) return []

  const positions = activePerpsPositions.map((position) => {
    const market = perpsMarketStates.find((market) => market.denom === position.denom)
    const asset = assets.find(byDenom(position.denom))

    if (!market || !asset) return null

    const adjustedPositionAmount = BN(demagnify(position.amount, asset))
    const price = position.currentPrice.shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
    const perpExposure = adjustedPositionAmount.multipliedBy(price)

    if (!perpExposure) return BN_ZERO

    return {
      ...position,
      perpExposure,
      fundingRate: market.current_funding_rate,
    }
  })

  return positions as ActivePerps[]
}
