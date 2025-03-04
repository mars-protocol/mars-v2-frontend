import classNames from 'classnames'

import Text from 'components/common/Text'
import { produceCountdown } from 'utils/formatters'

export const UNLOCK_TIME_META = { accessorKey: 'unlocksAt', header: 'Unlock time left' }

interface Props {
  unlocksAt?: number
}

export default function UnlockTime(props: Props) {
  const timeLeft = props.unlocksAt ? props.unlocksAt - Date.now() : 0

  return (
    <Text
      className={classNames(
        'group/label relative w-[84px] rounded-sm text-center leading-5 ml-auto ',
        timeLeft > 0 ? 'bg-purple/10 text-purple' : 'bg-green/10 text-green',
      )}
      size='xs'
    >
      {timeLeft > 0 ? produceCountdown(timeLeft) : 'Unlocked'}
    </Text>
  )
}
