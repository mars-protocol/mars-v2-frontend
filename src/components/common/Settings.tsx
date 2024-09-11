import classNames from 'classnames'

import useStore from 'store'
import Button from './Button'
import { Gear } from './Icons'

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
