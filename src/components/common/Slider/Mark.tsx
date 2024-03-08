import classNames from 'classnames'

interface Props {
  disabled?: boolean
  onClick: (value: number) => void
  sliderValue: number
  style?: {}
  value: number
}

export default function Mark(props: Props) {
  return (
    <button
      onClick={() => props.onClick(props.value)}
      className={classNames(
        'z-20 h-2 w-2 rotate-45 !outline-none rounded-xs border-[1px] border-white/20 hover:border-[1px] md:hover:border-white',
        (props.sliderValue < props.value || props.disabled) && '!bg-grey-medium',
      )}
      style={props.style}
      disabled={props.disabled}
    />
  )
}
