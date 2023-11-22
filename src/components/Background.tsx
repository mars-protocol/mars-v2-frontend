import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { getPage } from 'utils/route'

export default function Background() {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const [backgroundClasses, setBackgroundClasses] = useState<string[]>([
    'bg-body',
    'bg-orb-primary',
    'bg-orb-secondary',
    'bg-orb-tertiary',
  ])
  const { pathname } = useLocation()
  const page = getPage(pathname)
  const currentAppSection = useMemo(() => {
    switch (page.split('-')[0]) {
      case 'hls':
        setBackgroundClasses([
          'bg-body-hls',
          'bg-orb-primary-hls',
          'bg-orb-secondary-hls',
          'bg-orb-tertiary-hls',
        ])
        return 'hls'
      case 'stats':
        setBackgroundClasses([
          'bg-body',
          'bg-orb-primary-stats',
          'bg-orb-secondary-stats',
          'bg-orb-tertiary-stats',
        ])
        return 'stats'
      default:
        setBackgroundClasses(['bg-body', 'bg-orb-primary', 'bg-orb-secondary', 'bg-orb-tertiary'])
        return 'app'
    }
  }, [page])

  useEffect(() => {
    useStore.setState({ currentAppSection })
  }, [currentAppSection])

  return (
    <div
      className={classNames(
        'fixed inset-0',
        'w-full h-full',
        'overflow-hidden pointer-events-none background ',
        backgroundClasses[0],
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
          backgroundClasses[1],
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
          'bottom-[-20vw] right-[-10vw]',
          'blur-orb-secondary',
          backgroundClasses[2],
          'translate-x-0 translate-y-0  rounded-full opacity-30',
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
          backgroundClasses[3],
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          !reduceMotion && 'animate-[float_180s_ease-in_infinite]',
          !reduceMotion && 'transition-bg duration-1000 delay-300',
        )}
      />
    </div>
  )
}
