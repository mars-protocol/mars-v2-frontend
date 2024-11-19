import classNames from 'classnames'
import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { getPage } from 'utils/route'

export default function Background() {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const { pathname } = useLocation()
  const page = getPage(pathname, chainConfig)
  const [isHls, isV1] = useMemo(() => [page.split('-')[0] === 'hls', page === 'v1'], [page])

  useEffect(() => {
    useStore.setState({ isHls, isV1 })
  }, [isHls, isV1])

  const [primaryOrbClassName, secondaryOrbClassName, tertiaryOrbClassName, bodyClassName] =
    useMemo(() => {
      if (isHls) {
        return ['bg-orb-primary-hls', 'bg-orb-secondary-hls', 'bg-orb-tertiary-hls', 'bg-body-hls']
      }
      if (isV1) {
        return [
          'bg-transparent',
          'bg-transparent',
          'bg-transparent',
          'bg-body md:bg-v1 md:blur-[2px]',
        ]
      }

      return ['bg-orb-primary', 'bg-orb-secondary', 'bg-orb-tertiary', 'bg-body']
    }, [isHls, isV1])

  return (
    <div
      className={classNames(
        'fixed inset-0',
        'w-screen-full h-screen-full',
        'overflow-hidden pointer-events-none background',
        bodyClassName,
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
          primaryOrbClassName,
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
          secondaryOrbClassName,
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
          tertiaryOrbClassName,
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          !reduceMotion && 'animate-[float_180s_ease-in_infinite]',
          !reduceMotion && 'transition-bg duration-1000 delay-300',
        )}
      />
    </div>
  )
}
