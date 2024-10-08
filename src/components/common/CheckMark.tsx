import classNames from 'classnames'

import { CheckCircled } from 'components/common/Icons'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface Props {
  color?: string
  className?: string
}

export const CheckMark = ({ color = 'text-white', className }: Props) => {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const classes = classNames('inline-block relative h-5 w-5', className)

  if (reduceMotion) return <CheckCircled className={classNames(classes, color)} />

  return (
    <div className={classes}>
      <svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130.2 130.2'>
        <circle
          className='animate-circle'
          fill='none'
          strokeDasharray='1000'
          strokeDashoffset='0'
          stroke='currentColor'
          strokeWidth='6'
          strokeMiterlimit='10'
          cx='65.1'
          cy='65.1'
          r='62.1'
        />
        <polyline
          className='animate-check'
          fill='none'
          strokeDasharray='1000'
          strokeDashoffset='-100'
          stroke='currentColor'
          strokeWidth='6'
          strokeLinecap='round'
          strokeMiterlimit='10'
          points='100.2,40.2 51.5,88.8 29.8,67.5 '
        />
      </svg>
    </div>
  )
}
