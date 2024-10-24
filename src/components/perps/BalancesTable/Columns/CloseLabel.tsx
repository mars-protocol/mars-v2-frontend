import classNames from 'classnames'
import Text from 'components/common/Text'

type Props = {
  className?: string
}

export default function CloseLabel(props: Props) {
  const { className } = props
  return (
    <div className='inline-flex items-center gap-1'>
      <Text
        size='xs'
        tag='div'
        className={classNames(
          'capitalize px-2 py-0.5 rounded-sm flex items-center bg-purple/20 text-purple',
          className,
        )}
      >
        close
      </Text>
    </div>
  )
}
