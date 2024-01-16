import React from 'react'

import AmountAndValue from 'components/common/AmountAndValue'
import AssetImage from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Container from 'components/Modals/HLS/Deposit/Summary/Container'
import Text from 'components/common/Text'

interface Props {
  amount: BigNumber
  asset: Asset | BorrowAsset
  isBorrow?: boolean
}
export default function AssetSummary(props: Props) {
  return (
    <Container title={props.isBorrow ? 'Leverage' : 'Supplying'}>
      <div className='flex justify-between'>
        <span className='flex items-center gap-2'>
          <AssetImage asset={props.asset} size={32} />
          <Text size='xs' className='font-bold'>
            {props.asset.symbol}
          </Text>
        </span>
        <AmountAndValue asset={props.asset} amount={props.amount} isApproximation />
      </div>
      {props.isBorrow && (
        <div className='rounded-sm bg-white/5 grid place-items-center py-2 mt-3'>
          <FormattedNumber
            amount={(props.asset as BorrowAsset).borrowRate ?? 0}
            options={{ suffix: '% Borrow Rate', maxDecimals: 2, minDecimals: 0 }}
            className='text-white/70 text-xs'
          />
        </div>
      )}
    </Container>
  )
}
