import Button from 'components/Button'
import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import useToggle from 'hooks/useToggle'

interface Props extends ButtonProps {
  items: DropDownItem[]
  text: string
}

export default function DropDownButton(props: Props) {
  const [isOpen, toggleIsOpen] = useToggle(false)
  return (
    <Tooltip
      content={<DropDown closeMenu={() => toggleIsOpen(false)} {...props} />}
      type='info'
      placement='bottom'
      contentClassName='!bg-white/10 border border-white/20 backdrop-blur-xl !p-0'
      interactive
      hideArrow
      visible={isOpen}
      onClickOutside={() => toggleIsOpen(false)}
    >
      <Button
        onClick={() => toggleIsOpen()}
        rightIcon={<ChevronDown />}
        iconClassName='w-3 h-3'
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
    <div>
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
    <button
      onClick={() => {
        props.item.onClick()
        props.closeMenu()
      }}
      className=' px-4 py-3 flex gap-2 items-center hover:bg-white/5 w-full [&:not(:last-child)]:border-b border-white/10'
    >
      <div className='flex justify-center w-5 h-5'>{props.item.icon}</div>
      <Text size='sm'>{props.item.text}</Text>
    </button>
  )
}
