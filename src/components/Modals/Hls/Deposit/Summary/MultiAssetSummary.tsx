import AmountAndValue from 'components/common/AmountAndValue'
import AssetImage from 'components/common/assets/AssetImage'
import Container from 'components/common/Container'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import useAssets from 'hooks/assets/useAssets'
import React from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  coins: BNCoin[]
  isResult?: boolean
}
export default function MultiAssetSummary(props: Props) {
  const { data: assets } = useAssets()

  return (
    <Container title={props.isResult ? 'Final Position' : 'Supplying'}>
      <div className='flex'>
        {props.coins.map((coin, index) => {
          const lastItem = index === props.coins.length - 1
          const asset = assets.find(byDenom(coin.denom))
          if (!asset) return null
          return (
            <React.Fragment key={index}>
              <div className='flex justify-between flex-1'>
                <span className='flex items-center gap-2'>
                  <AssetImage asset={asset} className='w-8 h-8' />
                  <Text size='xs' className='font-bold'>
                    {asset.symbol}
                  </Text>
                </span>
                <AmountAndValue asset={asset} amount={coin.amount} />
              </div>
              {!lastItem && (
                <div className='flex items-center w-3 mx-3'>
                  <Plus />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </Container>
  )
}
