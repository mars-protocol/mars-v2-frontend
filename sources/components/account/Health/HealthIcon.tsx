import classNames from 'classnames'

import { ExclamationMarkCircled, Heart } from '../../common/Icons'

interface Props {
  isLoading: boolean
  health: number
  className?: string
  colorClass?: string
}

export default function HealthIcon(props: Props) {
  const { isLoading, health, className, colorClass } = props
  const color = colorClass ?? 'text-white'

  return (
    <div className='w-5'>
      {!isLoading && health === 0 ? (
        <ExclamationMarkCircled className={classNames(' text-loss animate-pulse', className)} />
      ) : (
        <Heart
          className={classNames(
            !isLoading && health <= 5 ? 'text-loss' : color,
            (isLoading || health <= 5) && 'animate-pulse',
            className,
          )}
        />
      )}
    </div>
  )
}
