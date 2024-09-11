import { useMemo } from 'react'
import useChainConfig from './useChainConfig'

export default function useIsOsmosis() {
  const chainConfig = useChainConfig()
  return useMemo(() => chainConfig.isOsmosis, [chainConfig])
}
