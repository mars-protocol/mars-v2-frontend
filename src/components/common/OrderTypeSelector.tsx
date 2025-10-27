import classNames from 'classnames'

import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import { OrderType } from 'types/enums'
import { capitalizeFirstLetter } from 'utils/helpers'

interface Props {
  orderTabs: OrderTab[]
  selected: OrderType
  onChange: (value: OrderType) => void
}

export default function OrderTypeSelector(props: Props) {
  const { selected, onChange } = props

  return (
    <div className='flex flex-row pb-1'>
      {props.orderTabs.map((tab) => {
        const isSelected = tab.type === selected
        const classes = classNames(
          'text-white/20 mr-4 pb-1 hover:cursor-pointer select-none flex flex-row',
          'hover:text-white',
          isSelected && 'border-b-2 border-martian-red !text-white',
          tab.isDisabled && 'pointer-events-none',
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
              {capitalizeFirstLetter(tab.type)}
              {tab.isDisabled && <InfoCircle className='w-4 h-4 mt-1 ml-2' />}
            </div>
          </ConditionalWrapper>
        )
      })}
    </div>
  )
}
