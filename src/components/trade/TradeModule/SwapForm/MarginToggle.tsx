import ConditionalWrapper from '../../../../hocs/ConditionalWrapper'
import Switch from '../../../common/Switch'
import Text from '../../../common/Text'
import { Tooltip } from '../../../common/Tooltip'

interface Props {
  checked: boolean
  onChange: (value: boolean) => void
  borrowAssetSymbol: string
  disabled?: boolean
}

export default function MarginToggle(props: Props) {
  return (
    <div className='flex justify-between w-full px-4 py-2 bg-white/5'>
      <Text size='sm'>Margin</Text>

      <ConditionalWrapper
        condition={!!props.disabled}
        wrapper={(children) => (
          <Tooltip
            type='info'
            content={
              <Text size='sm'>
                {props.borrowAssetSymbol} is not a borrowable asset. Please choose another asset to
                sell in order to margin trade.
              </Text>
            }
          >
            {children}
          </Tooltip>
        )}
      >
        <div className='flex flex-row'>
          <Switch {...props} name='margin' />
        </div>
      </ConditionalWrapper>
    </div>
  )
}
