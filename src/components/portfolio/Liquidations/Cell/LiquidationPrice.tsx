import DisplayCurrency from 'components/common/DisplayCurrency'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getSpotPriceDecimals } from 'utils/formatters'

interface Props {
  value: LiquidationDataItem
}

export default function LiquidationPrice(props: Props) {
  const { value } = props
  const { data: assets } = useAssets()

  const liquidationPrice = useMemo(() => {
    if (!value.price_liquidated || !value.collateral_asset_won || !assets) return null

    // Find the asset for the collateral
    const asset = assets.find(byDenom(value.collateral_asset_won.denom))
    if (!asset) return null

    const actualPrice = BN(value.price_liquidated).shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)

    return actualPrice
  }, [value.price_liquidated, value.collateral_asset_won, assets])

  if (!liquidationPrice) return <span>-</span>

  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', liquidationPrice)}
      options={{
        maxDecimals: getSpotPriceDecimals(liquidationPrice),
        abbreviated: false,
      }}
      showDetailedPrice
      className='text-xs'
    />
  )
}
