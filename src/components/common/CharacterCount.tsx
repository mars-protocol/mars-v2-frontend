import Text from 'components/common/Text'
import classNames from 'classnames'

interface Props {
  value: string
  maxLength: number
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
}

export default function CharacterCount(props: Props) {
  const { value, maxLength, size = 'sm' } = props
  return (
    <Text size={size} className='text-white/30'>
      <span
        className={classNames({
          'text-white/30': value.length <= 200,
          'text-warning': value.length > 200 && value.length < maxLength,
          'text-error': value.length >= maxLength,
        })}
      >
        {value.length}
      </span>
      /{maxLength}
    </Text>
  )
}
