import classNames from 'classnames'
import Button from 'components/common/Button'
import { Gear } from 'components/common/Icons'
import useStore from 'store'

interface Props {
  className?: string
  showText?: boolean
}

export default function Settings(props: Props) {
  return (
    <Button
      variant='solid'
      color='secondary'
      className={classNames(props.showText ? 'w-auto' : 'w-16', props.className)}
      leftIcon={<Gear />}
      text={props.showText ? 'Settings' : undefined}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
