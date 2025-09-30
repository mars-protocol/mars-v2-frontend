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
  const [isHls, isV1, isVaults] = useMemo(
    () => [page.split('-')[0] === 'hls', page === 'v1', page.includes('vaults')],
    [page],
  )

  useEffect(() => {
    useStore.setState({ isHls, isV1, isVaults })
  }, [isHls, isV1, isVaults])

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
      if (isVaults) {
        return [
          'bg-orb-primary-vaults',
          'bg-orb-secondary-vaults',
          'bg-orb-tertiary-vaults',
          'bg-body',
        ]
      }
      return ['bg-orb-primary', 'bg-orb-secondary', 'bg-orb-tertiary', 'bg-body']
    }, [isHls, isV1, isVaults])

  return (
    <div
      className={classNames(
        'fixed inset-0',
        'w-screen-full h-screen-full',
        'overflow-hidden pointer-events-none background',
        bodyClassName,
        !reduceMotion && 'transition-bg duration-1000 delay-300',
      )}
    />
  )
}
