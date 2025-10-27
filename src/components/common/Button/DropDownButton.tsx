import classNames from 'classnames'

import Button from 'components/common/Button/index'
import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useToggle from 'hooks/common/useToggle'

interface Props extends ButtonProps {
  items: DropDownItem[]
  text: string
  showProgressIndicator?: boolean
}

export default function DropDownButton(props: Props) {
  const [isOpen, toggleIsOpen] = useToggle(false)
  return (
    <Tooltip
      content={<DropDown closeMenu={() => toggleIsOpen(false)} {...props} />}
      type='info'
      placement='bottom'
      contentClassName='backdrop-blur-xl !p-0 w-full min-w-[140px]'
      interactive
      hideArrow
      visible={isOpen}
      onClickOutside={() => toggleIsOpen(false)}
    >
      <Button
        onClick={(e) => {
          toggleIsOpen()
          e.stopPropagation()
        }}
        rightIcon={<ChevronDown />}
        iconClassName='w-3 h-3'
        showProgressIndicator={props.showProgressIndicator}
        {...props}
      />
    </Tooltip>
  )
}

interface DropDownProps {
  items: DropDownItem[]
  closeMenu: () => void
}

function DropDown(props: DropDownProps) {
  return (
    <div className='w-full'>
      {props.items.map((item) => (
        <DropDownItem key={item.text} item={item} closeMenu={props.closeMenu} />
      ))}
    </div>
  )
}

interface DropDownItemProps {
  closeMenu: () => void
  item: DropDownItem
}

function DropDownItem(props: DropDownItemProps) {
  return (
    <ConditionalWrapper
      condition={!!props.item.disabledTooltip}
      wrapper={(children) => {
        return (
          <Tooltip
            type={(props.item.tooltipType || 'warning') as TooltipType}
            content={<Text size='sm'>{props.item.disabledTooltip}</Text>}
            contentClassName='max-w-[300px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault()
          props.item.onClick()
          props.closeMenu()
          e.stopPropagation()
        }}
        className={classNames(
          'z-1 px-4 py-3 flex gap-2 items-center  w-full [&:not(:last-child)]:border-b border-white/10',
          props.item.disabled ? 'bg-black/20 text-white/40 cursor-events-none' : 'hover:bg-white/5',
        )}
        disabled={props.item.disabled}
      >
        <div className='flex justify-center w-4 h-4'>{props.item.icon}</div>
        <Text size='sm'>{props.item.text}</Text>
      </button>
    </ConditionalWrapper>
  )
}
