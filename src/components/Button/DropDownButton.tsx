import Button from 'components/Button'
import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'

interface Props extends ButtonProps {
  items: DropDownItem[]
  text: string
}

export default function DropDownButton(props: Props) {
  return (
    <Tooltip
      content={<DropDown {...props} />}
      type='info'
      placement='bottom'
      contentClassName='!bg-white/10 border border-white/20 backdrop-blur-xl !p-0'
      interactive
      hideArrow
    >
      <Button rightIcon={<ChevronDown />} iconClassName='w-3 h-3' {...props} />
    </Tooltip>
  )
}

interface DropDownProps {
  items: DropDownItem[]
}

function DropDown(props: DropDownProps) {
  return (
    <div>
      {props.items.map((item) => (
        <DropDownItem key={item.text} {...item} />
      ))}
    </div>
  )
}

function DropDownItem(props: DropDownItem) {
  return (
    <button
      onClick={props.onClick}
      className=' px-4 py-3 flex gap-2 items-center hover:bg-white/5 w-full [&:not(:last-child)]:border-b border-white/10'
    >
      <div className='h-5 w-5 flex justify-center'>{props.icon}</div>
      <Text size='sm'>{props.text}</Text>
    </button>
  )
}
