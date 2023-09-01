import classNames from 'classnames'
import { HTMLAttributes } from 'react'

import Text from 'components/Text'
import { FormattedNumber } from 'components/FormattedNumber'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'

interface Props extends HTMLAttributes<HTMLDivElement> {
  action: 'buy'
  coins: BNCoin[]
}

export default function DepositCapMessage(props: Props) {
  if (!props.coins.length) return null

  return (
    <div className={classNames('flex-col gap-2 flex', props.className)}>
      <Text size='sm'>Deposit Cap Reached</Text>
      <Text size='xs' className='text-white/40'>{`Unfortunately you're not able to ${
        props.action
      } more than the following amount${props.coins.length > 1 ? 's' : ''}:`}</Text>
      {props.coins.map((coin) => {
        const asset = getAssetByDenom(coin.denom)

        if (!asset) return null

        return (
          <div key={coin.denom} className='flex gap-1'>
            <Text size='xs'>Cap Left:</Text>
            <FormattedNumber
              amount={coin.amount.toNumber()}
              options={{
                abbreviated: true,
                decimals: asset.decimals,
                suffix: ` ${asset.symbol}`,
              }}
              className='text-white/60 text-xs'
            />
          </div>
        )
      })}
    </div>
  )
}
