import classNames from 'classnames'

import { InfoCircle } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { ORDER_TYPE_TABS } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/constants'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import ConditionalWrapper from 'hocs/ConditionalWrapper'

interface Props {
  selected: AvailableOrderType
  onChange: (value: AvailableOrderType) => void
}

export default function OrderTypeSelector(props: Props) {
  const { selected, onChange } = props

  return (
    <div className={className.wrapper}>
      {ORDER_TYPE_TABS.map((tab) => {
        const isSelected = tab.type === selected
        const classes = classNames(className.tab, {
          [className.selectedTab]: isSelected,
          [className.disabledTab]: tab.isDisabled,
        })

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
              {tab.isDisabled && <InfoCircle className={className.infoCircle} />}
            </div>
          </ConditionalWrapper>
        )
      })}
    </div>
  )
}

const className = {
  wrapper: 'flex flex-1 flex-row px-3 pt-4',
  tab: 'mr-4 pb-2 cursor-pointer select-none flex flex-row',
  selectedTab: 'border-b-2 border-pink border-solid',
  disabledTab: 'opacity-20 pointer-events-none',
  infoCircle: 'w-4 h-4 ml-2 mt-1',
}
