import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

interface Props {
  checked: boolean
  onChange: (value: boolean) => void
  buyAssetSymbol: string
}

export default function AutoRepayToggle(props: Props) {
  return (
    <div className='flex flex-row justify-between w-full px-4 py-2 bg-white/5'>
      <div className='flex items-center gap-1'>
        <Text size='sm'>Auto Repay Debt</Text>
        <Tooltip
          type='info'
          content={
            <Text size='sm'>
              Use the bought {props.buyAssetSymbol} directly to repay your {props.buyAssetSymbol}{' '}
              debt.
            </Text>
          }
        />
      </div>

      <div className='flex flex-row'>
        <Switch {...props} name='repay' />
      </div>
    </div>
  )
}
