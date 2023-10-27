import { InfoCircle } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'

interface TooltipProps {
  content: string
  orientation: Orientation
}

export default function InfoTooltip(props: TooltipProps) {
  return (
    <Tooltip
      content={props.content}
      type='info'
      className={props.orientation === 'ltr' ? 'mr-1' : 'ml-1'}
    >
      <InfoCircle className='w-4 h-4 text-white/40 hover:text-inherit' />
    </Tooltip>
  )
}
