import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, getSpotPriceDecimals } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  value: BNCoin
  assetData: Asset[]
  priceAtLiquidation?: string
}

export default function LiquidatedAsset(props: Props) {
  const { value, assetData, priceAtLiquidation } = props

  const asset = assetData.find(byDenom(value.denom))

  const valueAtLiquidation = useMemo(() => {
    if (!priceAtLiquidation || !asset) return null

    return BN(priceAtLiquidation).multipliedBy(value.amount).shiftedBy(-PRICE_ORACLE_DECIMALS)
  }, [priceAtLiquidation, asset, value.amount])

  if (!asset) {
    return <Text size='xs'>Unknown Asset</Text>
  }

  const amount = demagnify(value.amount, asset)

  return (
    <TitleAndSubCell
      title={
        <div className='flex items-center justify-end gap-2'>
          <AssetImage asset={asset} className='w-4 h-4' />
          <Text size='xs'>{asset.symbol}</Text>
        </div>
      }
      sub={
        <div className='flex gap-0.5 justify-end'>
          <FormattedNumber
            amount={amount}
            options={{
              maxDecimals: getSpotPriceDecimals(amount),
              minDecimals: 2,
              abbreviated: false,
            }}
            className='text-xs text-white/50'
          />
          {valueAtLiquidation && (
            <>
              <span> | </span>
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber('usd', valueAtLiquidation)}
                options={{
                  abbreviated: false,
                  maxDecimals: 2,
                }}
                className='text-xs text-white/50'
              />
            </>
          )}
        </div>
      }
    />
  )
}
