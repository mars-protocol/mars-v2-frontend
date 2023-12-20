import classNames from 'classnames'
import { HTMLAttributes } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import { InfoCircle } from 'components/Icons'
import Text from 'components/Text'
import useAsset from 'hooks/assets/useAsset'
import { BNCoin } from 'types/classes/BNCoin'

interface Props extends HTMLAttributes<HTMLDivElement> {
  action: 'buy' | 'deposit' | 'fund'
  coins: BNCoin[]
  showIcon?: boolean
}

export default function DepositCapMessage(props: Props) {
  if (!props.coins.length) return null

  return (
    <div className={classNames('flex items-start', props.className)}>
      {props.showIcon && <InfoCircle width={26} className='mr-5' />}
      <div className='flex flex-col gap-2'>
        <Text size='sm'>Deposit Cap Reached!</Text>
        <Text size='xs' className='text-white/40'>{`Unfortunately you're not able to ${
          props.action
        } more than the following amount${props.coins.length > 1 ? 's' : ''}:`}</Text>
        {props.coins.map((coin) => (
          <AmountMessage key={coin.denom} coin={coin} />
        ))}
      </div>
    </div>
  )
}

interface AmountMessageProps {
  coin: BNCoin
}
function AmountMessage(props: AmountMessageProps) {
  const asset = useAsset(props.coin.denom)
  if (!asset) return null

  return (
    <div key={props.coin.denom} className='flex gap-1'>
      <Text size='xs'>Cap Left:</Text>
      <FormattedNumber
        amount={Math.max(0, props.coin.amount.toNumber())}
        options={{
          decimals: asset.decimals,
          suffix: ` ${asset.symbol}`,
        }}
        className='text-xs text-white/60'
      />
    </div>
  )
}
