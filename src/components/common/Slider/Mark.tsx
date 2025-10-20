import classNames from 'classnames'

interface Props {
  disabled?: boolean
  onClick: (value: number) => void
  sliderValue: number
  value: number
}

export default function Mark(props: Props) {
  return (
    <button
      onClick={() => props.onClick(props.value)}
      type='button'
      className={classNames(
        'z-20 h-2 w-2 rotate-45 !outline-none rounded-xs bg-martian-red hover:border md:hover:border-white',
        (props.sliderValue < props.value || props.disabled) &&
          'border border-white/20 !bg-grey-medium',
      )}
      disabled={props.disabled}
    />
  )
}
