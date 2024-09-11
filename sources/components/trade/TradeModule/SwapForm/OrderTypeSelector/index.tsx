import classNames from 'classnames'

import ConditionalWrapper from '../../../../../hocs/ConditionalWrapper'
import { InfoCircle } from '../../../../common/Icons'
import Text from '../../../../common/Text'
import { Tooltip } from '../../../../common/Tooltip'
import { ORDER_TYPE_TABS } from './constants'

interface Props {
  selected: AvailableOrderType
  onChange: (value: AvailableOrderType) => void
}

export default function OrderTypeSelector(props: Props) {
  const { selected, onChange } = props

  return (
    <div className='flex flex-row pt-4'>
      {ORDER_TYPE_TABS.map((tab) => {
        const isSelected = tab.type === selected
        const classes = classNames(
          'mr-4 pb-2 hover:cursor-pointer select-none flex flex-row',
          isSelected && 'border-b-2 border-pink border-solid',
          tab.isDisabled && 'opacity-20 pointer-events-none',
        )

        return (
          <ConditionalWrapper
            key={tab.type}
            condition={tab.isDisabled && !!tab.tooltipText}
            wrapper={(children) => (
              <Tooltip type='info' content={<Text size='sm'>{tab.tooltipText}</Text>}>
                {children}
              </Tooltip>
            )}
          >
            <div onClick={() => onChange(tab.type)} className={classes}>
              {tab.type}
              {tab.isDisabled && <InfoCircle className='w-4 h-4 mt-1 ml-2' />}
            </div>
          </ConditionalWrapper>
        )
      })}
    </div>
  )
}
