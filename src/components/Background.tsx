import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import { getPage } from 'utils/route'

export default function Background() {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const { pathname } = useLocation()
  const page = getPage(pathname)
  const isHLS = page.split('-')[0] === 'hls'

  return (
    <div
      className={classNames(
        'fixed inset-0',
        'w-full h-full',
        'overflow-hidden pointer-events-none background ',
        isHLS ? 'bg-body-hls' : 'bg-body',
        !reduceMotion && 'transition-bg duration-1000 delay-300',
      )}
    >
      <div
        className={classNames(
          'fixed',
          'h-[20vw] w-[20vw]',
          'min-h-[150px] min-w-[150px]',
          'max-h-[500px] max-w-[500px]',
          'left-[-10vw] top-[-10vw]',
          'blur-orb-primary',
          isHLS ? ' bg-orb-primary-hls' : 'bg-orb-primary',
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          !reduceMotion && 'animate-[float_120s_ease-in-out_infinite_2s]',
          !reduceMotion && 'transition-bg duration-1000 delay-300',
        )}
      />
      <div
        className={classNames(
          'fixed',
          'h-[40vw] w-[40vw]',
          'min-h-[400px] min-w-[400px]',
          'max-h-[1000px] max-w-[1000px]',
          'bottom-[-10vw] right-[-8vw]',
          'blur-orb-secondary',
          isHLS ? ' bg-orb-secondary-hls' : 'bg-orb-secondary',
          'translate-x-0 translate-y-0  rounded-full opacity-30',
          !reduceMotion && 'animate-[float_150s_ease-in-out_infinite_1s]',
          !reduceMotion && 'transition-bg duration-1000 delay-300',
        )}
      />
      <div
        className={classNames(
          'fixed',
          'h-[25vw] w-[25vw]',
          'min-h-[120px] min-w-[120px]',
          'max-h-[600px] max-w-[600px]',
          'right-[-4vw] top-[-10vw]',
          'blur-orb-tertiary ',
          isHLS ? ' bg-orb-tertiary-hls' : 'bg-orb-tertiary',
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          !reduceMotion && 'animate-[float_180s_ease-in_infinite]',
          !reduceMotion && 'transition-bg duration-1000 delay-300',
        )}
      />
    </div>
  )
}
