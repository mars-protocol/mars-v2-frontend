import classNames from 'classnames'
import Button from 'components/common/Button'
import { Gear } from 'components/common/Icons'
import useStore from 'store'

interface Props {
  className?: string
}

export default function Settings(props: Props) {
  return (
    <Button
      variant='solid'
      color='secondary'
      className={classNames('w-16', props.className)}
      leftIcon={<Gear />}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
